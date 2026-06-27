const NAMESPACE = 'http://www.w3.org/2000/svg';

const SVG_SIZE = 8000;
const MIN_NODE_SIZE = 100;
const MIN_LINE_WIDTH = 25;

function drawChart(svg, data) {
    svg.selectAll('*').remove();

    const link = svg
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .style('stroke', '#246e5d')
        .style('stroke-width', (data) => data.weight * MIN_LINE_WIDTH);

    const node = svg
        .selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', (data) => data.linkCount * MIN_NODE_SIZE)
        .style('fill', (data) => (data.isActive ? '#afffecdd' : '#dadadadd'));

    const text = svg
        .selectAll('text')
        .data(data.nodes)
        .enter()
        .append('text')
        .text((d) => d.name)
        .style('font-size', (d) => `${3 * d.linkCount}rem`);

    const simulaion = d3
        .forceSimulation(data.nodes)
        .force(
            'link',
            d3
                .forceLink()
                .id((d) => d.id)
                .links(data.links)
                // .distance((d) => (MIN_NODE_SIZE * 100000) / d.weight)
                .strength((d) => 0),
        )
        .force('charge', d3.forceManyBody().strength(-3 * SVG_SIZE))
        .force('center', d3.forceCenter(SVG_SIZE / 2, SVG_SIZE / 2))
        .force(
            'collision',
            d3
                .forceCollide()
                .radius((d) => d.linkCount * MIN_NODE_SIZE * 1.1)
                .iterations(3),
        )
        .on('tick', () => {
            link.attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);

            node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

            text.attr('x', (d) => d.x).attr('y', (d) => d.y);
        });
}
