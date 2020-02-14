import * as d3 from "d3";

//Margin conventions
const margin = { top: 40, right: 40, bottom: 40, left: 40 };
const width = 800 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

//draw base
const svg = d3
  .select(".drawingboard")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const g = svg.append("g").attr("transform", "translate(60,0)");

let root;
let gLink;
let gNode;

export default function drawOrgChart() {
  console.log("drawOrgChart");
  console.log("------------");
  d3.json("/assets/dendrogram_data.json").then(res => {
    draw(res);
    //anotherDraw(res);
  });
}

// converts data types ...you don't say!
function typeConversion(d) {
  return {
    Transaction_date: d.Transaction_date, //date
    Product: d.Product,
    Price: +d.Price,
    Payment_Type: d.Payment_Type,
    Name: d.Name,
    City: d.City,
    State: d.State,
    Country: d.Country,
    Account_Created: d.Account_Created, //date
    Last_Login: d.Last_Login, //date
    Latitude: +d.Latitude,
    Longitude: +d.Longitude
  };
}

// scales data proportionally
function scales(data) {
  console.log("scales ", data);

  //Statistical function to get min max from datasource
  const xExtent = d3.extent(data, d => d.Price);
  console.log("xExtent ", xExtent);

  const xScale = d3
    .scaleLinear()
    .domain(xExtent)
    .range([0, width]);

  console.log(xScale(xExtent[0]));
  console.log(xScale(xExtent[1]));
}

const tree = d3.cluster().size([height, width - 160]);

const stratify = d3.stratify().parentId(function(d) {
  return d.id.substring(0, d.id.lastIndexOf("."));
});

function draw(data) {
  console.log("draw");
  root = d3.hierarchy(data);
  tree(root);

  gLink = g
    .selectAll(".link")
    .data(root.descendants().slice(1))
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", function(d) {
      return (
        "M" +
        d.y +
        "," +
        d.x +
        "C" +
        (d.parent.y + 100) +
        "," +
        d.x +
        " " +
        (d.parent.y + 100) +
        "," +
        d.parent.x +
        " " +
        d.parent.y +
        "," +
        d.parent.x
      );
    });

  gNode = g
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", function(d) {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  /*
  node
    .append("circle")
    .attr("r", 8)
    .style("stroke", "steelblue")
    .style("fill", "white")
    .style("stroke-width", 3)*/

  const rectangle = gNode
    .append("rect")
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("x", -12.5)
    .attr("y", -12.5)
    .attr("width", 83)
    .attr("height", 25)
    //.attr("transform", function(d, i) { return "scale(" + (1 - d / 25) * 20 + ")"; })
    .style("stroke", "steelblue")
    .style("fill", "white");

  const text = gNode
    .append("text")
    .attr("dy", 3)
    /*
    .attr("x", function(d) {
      return d.children ? -15 : 15;
    })
    .style("text-anchor", function(d) {
      return d.children ? "end" : "start";
    })
    */
    .text(function(d) {
      return d.data.name;
    });
}
