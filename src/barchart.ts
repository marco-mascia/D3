
import crime_data from '../assets/crime_data.csv';
import sales_data from '../assets/sales.csv';
import * as d3 from "d3";


 //Margin conventions
 const margin = { top: 40, right: 40, bottom: 40, left: 40 };
 const width = 400 - margin.left - margin.right,
     height = 500 - margin.top - margin.bottom;


 //draw base
 const svg = d3.select('.drawingboard').append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

export default function drawBarChart() {
    console.log('drawBarChart');
    d3.csv('/assets/sales.csv', typeConversion).then(
        res => {
            scales(res)
        }
    );

}

// converts data types ...you don't say!
function typeConversion(d){

    return{
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
    }
}

function scales(data){
    console.log('scales ', data);

    //Statistical function to get min max from datasource
    const xExtent = d3.extent(data, d => d.Price);
    console.log('xExtent ', xExtent);

    const xScale = d3.scaleLinear()
    .domain(xExtent)
    .range([0, width])

    console.log(xScale(xExtent[0]))
    console.log(xScale(xExtent[1]))
}

function ready(data) {
    console.log('ready ', data);

}