// Load data
const countryMap = new Map();
const per100Map = new Map();
let countrySummaryMap = new Map();
let latestData = [];
let per100Data = [];
let globalMaxY;
let globalMaxX;
let globalMinX;
let currentScene = 0; 
let globalData;

const annotations = [
  "Scene 1: Overview of total COVID-19 vaccinations by country.",
  "Scene 2: Vaccinations per 100 people to adjust for population size.",
  "Scene 3: Daily vaccination trends per million for top countries.",
  "Scene 4: Summary of key vaccination information by country."
];

d3.csv("data/country_vaccinations.csv").then(data => {
    // Parse numbers, dates, etc.

    data.forEach(d => {
        const date = d.date;
        const country = d.country;
        const total = d.total_vaccinations;
        const perHundred = +d.total_vaccinations_per_hundred;
        const daily_vaccinations_per_m = +d.daily_vaccinations_per_million
        d.parsedDate = d3.timeParse("%Y-%m-%d")(d.date);
        if (!countryMap.has(country) || countryMap.get(country).date < date) {
            countryMap.set(country, {country, date, total});
        }
        if (!per100Map.has(country) || per100Map.get(country).date < date) {
            per100Map.set(country, { country, date, perHundred });
        }
    });

    latestData = Array.from(countryMap.values())
        .filter(d => !isNaN(d.total))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);

    per100Data = Array.from(per100Map.values())
        .filter(d => !isNaN(d.perHundred))
        .sort((a, b) => b.perHundred - a.perHundred)
        .slice(0, 15);
        const topTotalCountries = Array.from(
            d3.rollup(data, v => d3.max(v, d => +d.total_vaccinations), d => d.country)
          )
          .sort((a, b) => d3.descending(a[1], b[1]))
          .slice(0, 15)
          .map(d => d[0]);
      
          const topPer100Countries = Array.from(
            d3.rollup(data, v => d3.max(v, d => +d.total_vaccinations_per_hundred), d => d.country)
          )
          .sort((a, b) => d3.descending(a[1], b[1]))
          .slice(0, 15)
          .map(d => d[0]);
      
          // Save globally so you can access in any scene
          window.topTotalCountries = topTotalCountries;
          window.topPer100Countries = topPer100Countries;
          window.allTopCountries = [...new Set([...topTotalCountries, ...topPer100Countries])];
      
    globalData = data;
    globalMaxY = d3.max(globalData, d => +d.daily_vaccinations_per_million) * 1.05;
    globalMinX = d3.min(globalData, d => d.parsedDate);
    globalMaxX = d3.max(globalData, d => d.parsedDate);


    updateScene(); // Initially show scene 0
  });
//first chart
function drawBarChart(data) {
    const margin = { top: 50, right: 150, bottom: 70, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    
    const svg = d3.select("#viz")
      .append("svg")
      .attr("viewBox", `0 0 ${500} ${300}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .classed("responsive-svg", true);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
  
    const x = d3.scaleLog()
        .base(2)
        .domain([1, d3.max(data, d => d.total)])
        .range([0, width]);
  
    const y = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([0, height])
        .padding(0.2);
  
    g.append("g")
        .call(d3.axisLeft(y));
  
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")            
        .attr("dy", "0.15em");  

  
    g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", d => y(d.country))
        .attr("width", d => x(d.total))
        .attr("height", y.bandwidth())
        .attr("fill", "steelblue");
  
    g.selectAll("text.label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.total) + 5)
        .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
        .text(d => Math.round(d.total).toLocaleString())
        .style("font-size", "9px");
    g.append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)             // center horizontally
        .attr("y", height + margin.bottom - 5)  // below the x-axis ticks
        .attr("text-anchor", "middle")    // center text
        .style("font-size", "11px")
        .text("Total Vaccinations");
    g.append("text")
        .attr("class", "y axis-label")
        .attr("x", -height / 2)       // center along y axis (rotated)
        .attr("y", -margin.left + 15) // position to left of axis
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .text("Country");
    // Add arrow and annotation **after** drawing is complete
    g.selectAll("rect").each(function(d) {
      if (d.country === "China") {
        const bbox = this.getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y;
  
        // Add arrowhead marker
        g.append("defs").append("marker")
          .attr("id", "arrowhead")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 5)
          .attr("refY", 0)
          .attr("markerWidth", 4)
          .attr("markerHeight", 5)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "black");
  
        // Add arrow line
        g.append("line")
          .attr("x1", cx)
          .attr("y1", cy - 20)
          .attr("x2", cx)
          .attr("y2", cy)
          .attr("stroke", "black")
          .attr("stroke-width", 1.5)
          .attr("marker-end", "url(#arrowhead)");
  
        // Add explanatory text
        g.append("text")
          .attr("class", "annotation-label")
          .attr("x", cx)
          .attr("y", cy - 25)
          .attr("text-anchor", "middle")
          .text("China has the highest vaccination total at over 3 billion vaccinations.")
          .style("font-size", "6px")
          .style("font-family", "sans-serif");
        g.select(".annotation-label").raise();
      }
    });
  }

//second chart 
function drawBarChartPerHundred(data) {

const top15 = Array.from(per100Map.values())
    .filter(d => !isNaN(d.perHundred))
    .sort((a, b) => b.perHundred - a.perHundred)
    .slice(0, 15);

const margin = { top: 30, right: 100, bottom: 50, left: 150 };
const width = 600 - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;


const svg = d3.select("#viz2")
    .append("svg")
    .attr("viewBox", `0 0 ${600} ${350}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .classed("responsive-svg", true);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear()
    .domain([0, d3.max(top15, d => d.perHundred)])
    .range([0, width]);

const y = d3.scaleBand()
    .domain(top15.map(d => d.country))
    .range([0, height])
    .padding(0.2);

g.append("g").call(d3.axisLeft(y));

g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5));

g.selectAll("rect")
    .data(top15)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.country))
    .attr("width", d => x(d.perHundred))
    .attr("height", y.bandwidth())
    .attr("fill", "#4daf4a");

g.selectAll("text.label")
    .data(top15)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => x(d.perHundred) + 5)
    .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
    .text(d => d.perHundred.toFixed(1))
    .style("font-size", "8px");
g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)             // center horizontally
    .attr("y", height + margin.bottom - 20)  // below the x-axis ticks
    .attr("text-anchor", "middle")    // center text
    .style("font-size", "9px")
    .text("Vaccinations per 100 People");
g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -height / 2)       // center along y axis (rotated)
    .attr("y", -margin.left + 15) // position to left of axis
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "9px")
    .text("Country");
    g.selectAll("rect").each(function(d) {
        if (d.country === "Gibraltar") {
          const bbox = this.getBBox();
          const cx = bbox.x + bbox.width / 2;
          const cy = bbox.y;
    
          // Add arrowhead marker
          g.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "black");
    
          // Add arrow line
          g.append("line")
            .attr("x1", cx)
            .attr("y1", cy - 20)
            .attr("x2", cx)
            .attr("y2", cy)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("marker-end", "url(#arrowhead)");
    
          // Add explanatory text
          g.append("text")
            .attr("class", "annotation-label")
            .attr("x", cx)
            .attr("y", cy - 20)
            .attr("text-anchor", "middle")
            .text("Gilbraltar has a population of just under 40,000.")
            .style("font-size", "9px")
            .style("font-family", "sans-serif");
          g.select(".annotation-label").raise();
        }
      });
}

//third graph
function drawAllLinesChart(filteredData) {
    d3.select("#viz3").selectAll("*").remove(); // Clear old chart

    const margin = { top: 50, right: 200, bottom: 100, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
  
    const svg = d3.select("#viz3")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

  
    const parseDate = d3.timeParse("%Y-%m-%d");
    filteredData.forEach(d => {
      if (typeof d.date === "string") d.date = parseDate(d.date);
      d.daily_vaccinations_per_million = +d.daily_vaccinations_per_million;
    });
  
    const dataByCountry = d3.groups(filteredData, d => d.country);
  
    const x = d3.scaleTime()
      .domain([globalMinX, globalMaxX])
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, globalMaxY])
      .nice()
      .range([height, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(window.allTopCountries)
      .range(d3.schemeCategory10.concat(d3.schemeSet3));
  
    // Axes
    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")            
      .attr("dy", "0.15em");  
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // Draw all lines
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.daily_vaccinations_per_million));
  
    svg.selectAll(".line")
      .data(dataByCountry)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", d => color(d[0]))
      .attr("stroke-width", 1.5)
      .attr("d", d => line(d[1].sort((a, b) => a.date - b.date)));
    svg.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)             // center horizontally
      .attr("y", height + margin.bottom - 40)  // below the x-axis ticks
      .attr("text-anchor", "middle")    // center text
      .style("font-size", "9px")
      .text("Date");
    svg.append("text")
      .attr("class", "y axis-label")
      .attr("x", -height / 2)       // center along y axis (rotated)
      .attr("y", -margin.left + 15) // position to left of axis
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "9px")
      .text("COVID-19 Vacccinations per million");
    // Legend
    svg.selectAll(".legend")
      .data(dataByCountry.map(d => d[0]))
      .enter()
      .append("text")
      .attr("x", width + 10)
      .attr("y", (d, i) => i * 15)
      .text(d => d)
      .style("fill", d => color(d))
      .style("font-size", "8px");
  }
  //third chart but single graph
  function drawSingleCountryLine(countryData) {
    d3.select("#viz3").selectAll("*").remove();
  
    if (countryData.length === 0) return;
  
    const margin = { top: 50, right: 200, bottom: 100, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
  
    const svg = d3.select("#viz3")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .style("width", "100%")
        .style("height", "auto")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
  
    const parseDate = d3.timeParse("%Y-%m-%d");
    countryData.forEach(d => {
      if (typeof d.date === "string") d.date = parseDate(d.date);
      d.daily_vaccinations_per_million = +d.daily_vaccinations_per_million;
    });
  
    const x = d3.scaleTime()
      .domain([globalMinX, globalMaxX])
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, globalMaxY])
      .nice()
      .range([height, 0]);
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")            
      .attr("dy", "0.15em");  
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // Line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.daily_vaccinations_per_million));
  
    svg.append("path")
      .datum(countryData.sort((a, b) => a.date - b.date))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
    svg.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)             // center horizontally
      .attr("y", height + margin.bottom - 40)  // below the x-axis ticks
      .attr("text-anchor", "middle")    // center text
      .style("font-size", "9px")
      .text("Date");
    svg.append("text")
      .attr("class", "y axis-label")
      .attr("x", -height / 2)       // center along y axis (rotated)
      .attr("y", -margin.left + 15) // position to left of axis
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "9px")
      .text("COVID-19 Vacccinations per million");
  
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(countryData[0].country);
  }
  function drawCountryList(countries, data) {
    const container = d3.select("#country-list");
    container.selectAll("*").remove();
  
    container.selectAll("div")
      .data(countries)
      .enter()
      .append("div")
      .style("padding", "5px")
      .style("cursor", "pointer")
      .style("color", "steelblue")
      .text(d => d)
      .on("click", (event, country) => {
        const countryData = data.filter(d => d.country === country);
        drawSingleCountryLine(countryData);
      });
  }
// Fourth scene: summary
function drawCountrySummary(country, data) {
    const container = d3.select("#summary-info");
    container.selectAll("*").remove();
  
    // Filter for the country's records, find the latest date
    const countryData = data.filter(d => d.country === country);
    if (countryData.length === 0) {
      container.append("p").text("No data available");
      return;
    }
  
    // Sort by date ascending
    countryData.sort((a, b) => d3.ascending(a.date, b.date));
  
    const latest = countryData[countryData.length - 1];
  
    // Create a simple table to show latest stats for the country
    const table = container.append("table").style("border-collapse", "collapse");
  
    const fields = [
        { label: "Country", value: latest.country },
        { label: "Date", value: latest.date },
        {
          label: "Total Vaccinations",
          value: latest.total_vaccinations ? Math.round(latest.total_vaccinations).toLocaleString() : "N/A"
        },
        {
          label: "People Vaccinated",
          value: latest.people_vaccinated ? Math.round(latest.people_vaccinated).toLocaleString() : "N/A"
        },
        {
          label: "People Fully Vaccinated",
          value: latest.people_fully_vaccinated ? Math.round(latest.people_fully_vaccinated).toLocaleString() : "N/A"
        },
        {
          label: "Daily Vaccinations (Raw)",
          value: latest.daily_vaccinations_raw ? Math.round(latest.daily_vaccinations_raw).toLocaleString() : "N/A"
        },
        {
          label: "Daily Vaccinations (Smoothed)",
          value: latest.daily_vaccinations ? Math.round(latest.daily_vaccinations).toLocaleString() : "N/A"
        },
        {
          label: "Total Vaccinations per 100",
          value: isNaN(+latest.total_vaccinations_per_hundred)
            ? "N/A"
            : Math.round(+latest.total_vaccinations_per_hundred).toString()
        },
        {
          label: "People Vaccinated per 100",
          value: isNaN(+latest.people_vaccinated_per_hundred)
            ? "N/A"
            : Math.round(+latest.people_vaccinated_per_hundred).toString()
        },
        {
          label: "People Fully Vaccinated per 100",
          value: isNaN(+latest.people_fully_vaccinated_per_hundred)
            ? "N/A"
            : Math.round(+latest.people_fully_vaccinated_per_hundred).toString()
        },
        {
          label: "Daily Vaccinations per Million",
          value: isNaN(+latest.daily_vaccinations_per_million)
            ? "N/A"
            : Math.round(+latest.daily_vaccinations_per_million).toLocaleString()
        },
        { label: "Vaccines Used", value: latest.vaccines || "N/A" },
        { label: "Source Name", value: latest.source_name || "N/A" },
        { label: "Source Website", value: latest.source_website || "N/A" }
      ];
      
  
    fields.forEach(f => {
      const row = table.append("tr");
      row.append("td")
        .text(f.label)
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("font-weight", "bold");
      row.append("td")
        .text(f.value)
        .style("border", "1px solid #ccc")
        .style("padding", "5px");
    });
  }

  //draw clickable country list
function drawSummaryCountryList(countries, data) {
    const container = d3.select("#summary-country-list");
    container.selectAll("*").remove();
  
    container.selectAll("div")
      .data(countries)
      .enter()
      .append("div")
      .style("padding", "5px")
      .style("cursor", "pointer")
      .style("color", "steelblue")
      .style("border-bottom", "1px solid #eee")
      .text(d => d)
      .on("click", (event, country) => {
        drawCountrySummary(country, data);
      });
}

function clearCharts() {
    d3.select("#viz").selectAll("*").remove();
    d3.select("#viz2").selectAll("*").remove();
    d3.select("#viz3").selectAll("*").remove();
}

function updateScene() {
    clearCharts();
  
    // Update annotation text
    d3.select("#annotation").text(annotations[currentScene]);
    d3.select("#scene1-content").style("display", "none");
    d3.select("#scene2-content").style("display", "none");
    d3.select("#scene3-content").style("display", "none");
    d3.select("#scene4-content").style("display", "none");
    d3.select("#intro-par").style("display", "none");
    if (currentScene === 0) {
      d3.select("#scene1-content").style("display", "block");
      drawBarChart(latestData);
    } else if (currentScene === 1) {
      d3.select("#scene2-content").style("display", "block");
      drawBarChartPerHundred(per100Data);
    } else if (currentScene === 2) {
        d3.select("#scene3-content").style("display", "block");
        const filteredData = globalData.filter(d => window.allTopCountries.includes(d.country));
        drawCountryList(window.allTopCountries, filteredData);
        drawAllLinesChart(filteredData);
    } else if (currentScene === 3) {
        d3.select("#scene4-content").style("display", "flex");
        const countries = Array.from(new Set(globalData.map(d => d.country))).sort();
        drawSummaryCountryList(countries, globalData);
        if (countries.length > 0) {
            drawCountrySummary(countries[0], globalData);
        }
    } else {
      d3.select("#scene1-content").style("display", "none");
      d3.select("#scene2-content").style("display", "none");
      d3.select("#scene3-content").style("display", "none");
      d3.select("#viz").append("p").text("More interactive exploration coming soon!");
    }
}

d3.select("#nextBtn").on("click", () => {
    if (currentScene < annotations.length - 1) {
      currentScene++;
      updateScene();
    }
});
  
d3.select("#prevBtn").on("click", () => {
    if (currentScene > 0) {
      currentScene--;
      updateScene();
    }
});

d3.select("#showAllBtn").on("click", () => {
    const filteredData = globalData.filter(d => window.allTopCountries.includes(d.country));
    drawAllLinesChart(filteredData);
  });
