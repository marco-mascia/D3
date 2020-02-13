import './scss/main.scss';
import * as d3 from "d3";
import crime_data from '../assets/crime_data.csv';
import dendrogram_data from '../assets/dendrogram_data.json';

const messages = {
    header: 'intestazione',
    main: 'corpo',
    aside: 'lato',
    footer: 'piè di pagina'
}

export function init() {
    console.log("Init");

    /*
    const svg = d3.select('.drawingboard')
     .append('svg')
     .attr('height', 400)
     .attr('width', 800);

     const lollypop = svg.append('g').attr('transform', 'translate(200, 200)');

     const line = lollypop
     .append('line')
     .attr('x2', 200)
     .style('stroke', 'black');

     const circle = lollypop
     .append('circle')
     .attr('cx', 200)
     .attr('r', 10)
     .style('stroke', 'black')
     .style('fill', 'red');

     const label = lollypop
     .append('text')
     .text('Lollypop')
     .attr('y', -10);
     */

    //d3.csv('../assets/crime_data.csv').then(res => { console.log('loaded ', res) });
    //console.log('crime_data', crime_data);

    // set the dimensions and margins of the graph
    var width = 800
    var height = 460

    // append the svg object to the body of the page
    var svg = d3.select(".drawingboard")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(40,0)"); // bit of margin on the left = 40

 

    var g = svg.append("g").attr("transform", "translate(60,0)");

    var tree = d3.cluster()
        .size([height, width - 160]);

    var stratify = d3.stratify()
        .parentId(function (d) {
            return d.id.substring(0, d.id.lastIndexOf("."));
        });

    function draw(data) {
        var root = d3.hierarchy(data);
        tree(root);

        var link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                return "M" + d.y + "," + d.x +
                    "C" + (d.parent.y + 100) + "," + d.x +
                    " " + (d.parent.y + 100) + "," + d.parent.x +
                    " " + d.parent.y + "," + d.parent.x;
            });

        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            })

        node.append("circle")
            .attr("r", 8)
            .style("stroke", 'navy')
            .style("fill", "white");

        node.append("text")
            .attr("dy", 3)
            .attr("x", function (d) {
                return d.children ? -15 : 15;
            })
            .style("text-anchor", function (d) {
                return d.children ? "end" : "start";
            })
            .text(function (d) {
                return d.data.name;
            });

    }

    //draw(dendrogram_data);
    draw(dendrogram_data);

}
init();