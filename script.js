// Load data
const countryMap = new Map();
const perCapitaMap = new Map();
let latestData = [];
let perCapitaData = [];

let currentScene = 0; // Parameter to track which scene is active

const annotations = [
  "Scene 1: Overview of total COVID-19 vaccinations by country.",
  "Scene 2: Vaccinations per 100 people to adjust for population size.",
  "Scene 3: Interactive exploration or additional insights can go here."
];

d3.csv("data/country_vaccinations.csv").then(data => {
    // Parse numbers, dates, etc.

    data.forEach(d => {
        const date = d.date;
        const country = d.country;
        const total = d.total_vaccinations;
        const perHundred = +d.total_vaccinations_per_hundred

        if (!countryMap.has(country) || countryMap.get(country).date < date) {
            countryMap.set(country, {country, date, total});
        }
        if (!perCapitaMap.has(country) || perCapitaMap.get(country).date < date) {
            perCapitaMap.set(country, { country, date, perHundred });
        }

    });

    latestData = Array.from(countryMap.values())
        .filter(d => !isNaN(d.total))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);

    perCapitaData = Array.from(perCapitaMap.values())
        .filter(d => !isNaN(d.perHundred))
        .sort((a, b) => b.perHundred - a.perHundred)
        .slice(0, 15);

    updateScene(); // Initially show scene 0
  });
//first chart
function drawBarChart(data) {
const margin = { top: 30, right: 200, bottom: 40, left: 150 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLog()
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

const top15 = Array.from(perCapitaMap.values())
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

function clearCharts() {
    d3.select("#viz").selectAll("*").remove();
    d3.select("#viz2").selectAll("*").remove();
}

function updateScene() {
    clearCharts();
  
    // Update annotation text
    d3.select("#annotation").text(annotations[currentScene]);
  
    if (currentScene === 0) {
      d3.select("#scene1-content").style("display", "block");
      d3.select("#scene2-content").style("display", "none");
      drawBarChart(latestData);
    } else if (currentScene === 1) {
      d3.select("#scene1-content").style("display", "none");
      d3.select("#scene2-content").style("display", "block")
      drawBarChartPerHundred(perCapitaData);
    } else {
      d3.select("#scene1-content").style("display", "none");
      d3.select("#scene2-content").style("display", "none");
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
