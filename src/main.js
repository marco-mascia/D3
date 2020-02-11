import './scss/main.scss';
import * as d3 from "d3";
import crime_data from '../assets/crime_data.csv';

const messages = {
    header: 'intestazione',
    main: 'corpo',
    aside: 'lato',
    footer: 'piè di pagina'
}

export function init() {
   console.log("Init");

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
    .attr('y', -10)

    d3.csv(crime_data).then(res => { console.log('loaded ', res) });


}
init();