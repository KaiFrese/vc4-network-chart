const NAMESPACE = 'http://www.w3.org/2000/svg';

const SVG_SIZE = 1050;

function drawChart(svg, data) {
    svg.selectAll('*').remove();

    const link = svg
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .style('stroke', '#777');

    const node = svg
        .selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', 20)
        .style('fill', '#69b3a2');

    const simulaion = d3
        .forceSimulation(data.nodes)
        .force(
            'link',
            d3
                .forceLink()
                .id((d) => d.id)
                .links(data.links),
        )
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(SVG_SIZE / 2, SVG_SIZE / 2))
        .on('end', () => {
            link.attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);

            node.attr('cx', (d) => d.x + 6).attr('cy', (d) => d.y - 6);
        });
}
