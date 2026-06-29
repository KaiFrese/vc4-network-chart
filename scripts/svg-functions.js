const NAMESPACE = 'http://www.w3.org/2000/svg';

const SVG_SIZE = 8000;
const MIN_NODE_SIZE = 200;
const MIN_LINE_WIDTH = 1;
const LINK_ACTIVE_COLOR = '#246e5d';
const LINK_INACTIVE_COLOR = '#929292';
const NODE_ACTIVE_COLOR = '#afffecdd';
const NODE_INACTIVE_COLOR = '#e7e7e7dd';

function drawChart(svg, data) {
    svg.selectAll('*').remove();

    const link = svg
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .style('stroke', (data) =>
            data.isActive ? LINK_ACTIVE_COLOR : LINK_INACTIVE_COLOR,
        )
        .style('stroke-width', (data) => data.weight * 100 + MIN_LINE_WIDTH);

    const node = svg
        .selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', (data) => data.linkCount * 1000 + MIN_NODE_SIZE)
        .style('fill', (data) =>
            data.isActive ? NODE_ACTIVE_COLOR : NODE_INACTIVE_COLOR,
        );

    const text = svg
        .selectAll('text')
        .data(data.nodes)
        .enter()
        .append('text')
        .text((data) => data.name)
        .style('font-size', (data) => `${3 * data.linkCount * 10 + 2}rem`);

    const simulation = d3
        .forceSimulation(data.nodes)
        .force(
            'link',
            d3
                .forceLink()
                .id((data) => data.id)
                .links(data.links)
                .strength((data) => data.weight),
        )
        .force('charge', d3.forceManyBody().strength(-3 * SVG_SIZE))
        .force('center', d3.forceCenter(SVG_SIZE / 2, SVG_SIZE / 2))
        .force(
            'collision',
            d3
                .forceCollide()
                .radius((data) => data.linkCount * 3000 + MIN_NODE_SIZE)
                .iterations(3),
        )
        .on('tick', () => {
            link.attr('x1', (data) => data.source.x)
                .attr('y1', (data) => data.source.y)
                .attr('x2', (data) => data.target.x)
                .attr('y2', (data) => data.target.y);

            node.attr('cx', (data) => data.x).attr('cy', (data) => data.y);

            text.attr('x', (data) => data.x).attr('y', (data) => data.y);
        });

    return { simulation, node, link };
}
