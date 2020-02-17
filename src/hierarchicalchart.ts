import * as d3 from "d3";

export default function drawHierarchicalChart() {
  d3.json("/assets/flare.json").then(res => {
    update(res);
  });

  // Set the dimensions and margins of the diagram
  const margin = { top: 20, right: 90, bottom: 30, left: 90 },
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select(".drawingboard")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom);

  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const g = svg
    .append("g")
    .attr("class", "drawarea")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  let tickPadding = 4;
  let xScale = d3
    .scaleLinear()
    .domain([0, width])
    .range([0, width]);

  let yScale = d3
    .scaleLinear()
    .domain([0, height])
    .range([0, height]);

  let xAxis = d3
    .axisBottom(xScale)
    .ticks(7)
    .tickSize(height)
    .tickPadding(tickPadding - height);

  let yAxis = d3
    .axisRight(yScale)
    .ticks(5)
    .tickSize(width)
    .tickPadding(tickPadding - width);

  let xGroup = svg.select(".axis-x").call(xAxis);
  let yGroup = svg.select(".axis-y").call(yAxis);

  let view = svg.select(".drawarea");
  let minZoom = 1 / 20;
  let maxZoom = 20;

  let zoom = d3
    .zoom()
    .scaleExtent([minZoom, maxZoom])
    .translateExtent([
      [0, 0],
      [width, height]
    ])
    .on("zoom", () => {
      let t = d3.event.transform;
      view.attr("transform", t);
      xGroup.call(xAxis.scale(t.rescaleX(xScale)));
      yGroup.call(yAxis.scale(t.rescaleY(yScale)));
      d3.select("#reset-button").text(
        "translate(" +
          Math.floor(t.x) +
          ", " +
          Math.floor(t.y) +
          ") scale(" +
          t.k.toFixed(2) +
          ")"
      );
      //applyStyling();
    });
  svg.call(zoom);

  function update(data) {
    let i = 0,
      duration = 750,
      root;

    // declares a tree layout and assigns the size
    let treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(data, function(d) {
      return d.children;
    });
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);
    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    function update(source) {
      // Assigns the x and y position for the nodes
      let treeData = treemap(root);

      // Compute the new tree layout.
      let nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function(d) {
        d.y = d.depth * 180;
      });

      // ****************** Nodes section ***************************

      // Update the nodes...
      let node = g.selectAll("g.node").data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });

      // Enter any new modes at the parent's previous position.
      let nodeEnter = node
        .enter()
        .append("g")
        .attr("class", function(d) {
          return "node level-" + d.depth; // add the node depth
        })
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", click);

      // Add Circle for the nodes
      /*
      nodeEnter
        .append("circle")
        .attr("class", "node")
        .attr("r", 1e-6)
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
        });
        */

      const rectangle = nodeEnter
        .append("rect")
        .attr("class", "node")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("x", -15)
        .attr("y", -15)
        .attr("width", 150)
        .attr("height", 30)
        .style("stroke", "steelblue")
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "white";
        });

      // Add labels for the nodes
      nodeEnter
        .append("text")
        .attr("dy", ".40em")
        .attr("x", function(d) {
          //return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function(d) {
          //return d.children || d._children ? "end" : "start";
        })
        .text(function(d) {
          return d.data.name;
        });

      // UPDATE
      let nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "translate(" + d.y + "," + d.x + ")";
        });

      // Update the node attributes and style
      nodeUpdate
        .select("rect.node")
        .attr("r", 10)
        .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
        })
        .attr("cursor", "pointer");

      // Remove any exiting nodes
      let nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit
        .select("rect")
        .attr("rx", 1e-6)
        .attr("ry", 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select("text").style("fill-opacity", 1e-6);

      // ****************** links section ***************************

      // Update the links...
      let link = g.selectAll("path.link").data(links, function(d) {
        return d.id;
      });

      // Enter any new links at the parent's previous position.
      let linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", function(d) {
          return "link level-" + d.depth; // add the node depth
        })
        //.attr("class", "link")
        .attr("d", function(d) {
          let o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });

      // UPDATE
      let linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate
        .transition()
        .duration(duration)
        .attr("d", function(d) {
          return diagonal(d, d.parent);
        });

      // Remove any exiting links
      let linkExit = link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", function(d) {
          let o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s, d) {
        /*
        let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y ) / 2} ${s.x},
              ${(s.y + d.y ) / 2} ${d.x},
              ${d.y} ${d.x}`;*/
        /*
        let path = `M ${s.y} ${s.x}
              C ${(s.y - d.y) } ${s.x},
                ${(s.y + d.y)} ${d.x},
                ${d.y + 120} ${d.x}`;*/
        //console.log("s ", s);
        //console.log("d ", d);
        let path = `M ${s.y} ${s.x} L ${d.y + 125} ${d.x}`;
        return path;
      }

      // Toggle children on click.
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }
  }
}
