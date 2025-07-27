// Load data
const countryMap = new Map();
const per100Map = new Map();
let latestData = [];
let per100Data = [];

let currentScene = 0; // Parameter to track which scene is active

const annotations = [
  "Scene 1: Overview of total COVID-19 vaccinations by country.",
  "Scene 2: Vaccinations per 100 people to adjust for population size.",
  "Scene 3: Daily vaccination trends per million for top countries."
];

d3.csv("data/country_vaccinations.csv").then(data => {
    // Parse numbers, dates, etc.

    data.forEach(d => {
        const date = d.date;
        const country = d.country;
        const total = d.total_vaccinations;
        const perHundred = +d.total_vaccinations_per_hundred;
        const daily_vaccinations_per_m = +d.daily_vaccinations_per_million

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
    updateScene(); // Initially show scene 0
  });
//first chart
function drawBarChart(data) {
const margin = { top: 30, right: 200, bottom: 40, left: 150 };
const width = 1500 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLog()
    .base(2)
    .domain([1, d3.max(data, d => d.total)])
    .range([0, width]);

const y = d3.scaleBand()
    .domain(data.map(d => d.country))
    .range([0, height])
    .padding(0.2);

svg.append("g")
    .call(d3.axisLeft(y));

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5))
    .selectAll("text")
    .style("text-anchor", "middle");

svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.country))
    .attr("width", d => x(d.total))
    .attr("height", y.bandwidth())
    .attr("fill", "steelblue");

svg.selectAll("text.label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => x(d.total) + 5)
    .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
    .text(d => d.total.toLocaleString())
    .style("font-size", "12px");
}


//second chart 
function drawBarChartPerHundred(data) {

const top15 = Array.from(per100Map.values())
    .filter(d => !isNaN(d.perHundred))
    .sort((a, b) => b.perHundred - a.perHundred)
    .slice(0, 15);

const margin = { top: 30, right: 100, bottom: 40, left: 150 };
const width = 1300 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#viz2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear()
    .domain([0, d3.max(top15, d => d.perHundred)])
    .range([0, width]);

const y = d3.scaleBand()
    .domain(top15.map(d => d.country))
    .range([0, height])
    .padding(0.2);

svg.append("g").call(d3.axisLeft(y));

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5));

svg.selectAll("rect")
    .data(top15)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.country))
    .attr("width", d => x(d.perHundred))
    .attr("height", y.bandwidth())
    .attr("fill", "#4daf4a");

svg.selectAll("text.label")
    .data(top15)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => x(d.perHundred) + 5)
    .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
    .text(d => d.perHundred.toFixed(1))
    .style("font-size", "12px");
}

//third graph
function drawAllLinesChart(filteredData) {
    d3.select("#viz3").selectAll("*").remove(); // Clear old chart

    const margin = { top: 50, right: 200, bottom: 50, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    const svg = d3.select("#viz3")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const parseDate = d3.timeParse("%Y-%m-%d");
    filteredData.forEach(d => {
      if (typeof d.date === "string") d.date = parseDate(d.date);
      d.daily_vaccinations_per_million = +d.daily_vaccinations_per_million;
    });
  
    const dataByCountry = d3.groups(filteredData, d => d.country);
  
    const x = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.date))
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.daily_vaccinations_per_million)])
      .nice()
      .range([height, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(window.allTopCountries)
      .range(d3.schemeCategory10.concat(d3.schemeSet3));
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));
  
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
  
    // Legend
    svg.selectAll(".legend")
      .data(dataByCountry.map(d => d[0]))
      .enter()
      .append("text")
      .attr("x", width + 10)
      .attr("y", (d, i) => i * 15)
      .text(d => d)
      .style("fill", d => color(d))
      .style("font-size", "10px");
  }
  function drawSingleCountryLine(countryData) {
    d3.select("#viz3").selectAll("*").remove();
  
    if (countryData.length === 0) return;
  
    const margin = { top: 50, right: 100, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#viz3")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const parseDate = d3.timeParse("%Y-%m-%d");
    countryData.forEach(d => {
      if (typeof d.date === "string") d.date = parseDate(d.date);
      d.daily_vaccinations_per_million = +d.daily_vaccinations_per_million;
    });
  
    const x = d3.scaleTime()
      .domain(d3.extent(countryData, d => d.date))
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(countryData, d => d.daily_vaccinations_per_million)])
      .nice()
      .range([height, 0]);
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));
  
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

function clearCharts() {
    d3.select("#viz").selectAll("*").remove();
    d3.select("#viz2").selectAll("*").remove();
    d3.select("#viz3").selectAll("*").remove();
}

function updateScene() {
    clearCharts();
  
    // Update annotation text
    d3.select("#annotation").text(annotations[currentScene]);
  
    if (currentScene === 0) {
      d3.select("#scene1-content").style("display", "block");
      d3.select("#scene2-content").style("display", "none");
      d3.select("#scene3-content").style("display", "none");
      drawBarChart(latestData);
    } else if (currentScene === 1) {
      d3.select("#scene1-content").style("display", "none");
      d3.select("#scene2-content").style("display", "block");
      d3.select("#scene3-content").style("display", "none");
      drawBarChartPerHundred(per100Data);
    } else if (currentScene === 2) {
        d3.select("#scene1-content").style("display", "none");
        d3.select("#scene2-content").style("display", "none");
        d3.select("#scene3-content").style("display", "block");
        const filteredData = globalData.filter(d => window.allTopCountries.includes(d.country));
        drawCountryList(window.allTopCountries, filteredData);
        drawAllLinesChart(filteredData);
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
