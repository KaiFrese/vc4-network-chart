('use strict');

document.addEventListener('DOMContentLoaded', async () => {
    const fileReader = new FileReader();
    let networkData;
    let searchString = '';
    let chartSVG = d3
        .select('#chart-svg-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${SVG_SIZE} ${SVG_SIZE}`);

    const svg = chartSVG.append('g');
    let zoom = d3.zoom().on('zoom', handleZoomAndPan);
    chartSVG.call(zoom);
    zoom.scaleTo(chartSVG, 0.03);

    document.getElementById('file-input').addEventListener('change', () => {
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length > 0) {
            fileReader.readAsText(fileInput.files[0]);
        }
    });

    fileReader.addEventListener('load', () => {
        const data = d3.tsvParse(fileReader.result, d3.autoType);

        if (data.length > 0) {
            networkData = { nodes: [], links: [] };
            const keys = Object.keys(data[0]);

            data.forEach((line) => {
                source = networkData.nodes.find(
                    (node) => line[keys[0]] === node.name,
                );
                target = networkData.nodes.find(
                    (node) => line[keys[1]] === node.name,
                );

                if (source === undefined) {
                    source = {
                        name: line[keys[0]],
                        id: networkData.nodes.length,
                        linkCount: 1,
                    };
                    networkData.nodes.push(source);
                }

                if (target === undefined) {
                    target = {
                        name: line[keys[1]],
                        id: networkData.nodes.length,
                        linkCount: 1,
                    };
                    networkData.nodes.push(target);
                }

                networkData.links.push({
                    source: source.id,
                    target: target.id,
                    weight: line[keys[2]],
                });

                source.linkCount++;
                target.linkCount++;
            });

            networkData = updateSearchSelection(networkData, searchString);

            drawChart(svg, networkData);
        }
    });

    document
        .getElementById('search-input')
        .addEventListener('keyup', (event) => {
            searchString = event.target.value;

            networkData = updateSearchSelection(networkData, searchString);

            drawChart(svg, networkData);
        });
});

function updateSearchSelection(data, searchString) {
    return {
        ...data,
        nodes: data.nodes.map((node) => ({
            ...node,
            isActive: node.name.includes(searchString),
        })),
    };
}

function handleZoomAndPan(event) {
    d3.select('svg g').attr('transform', event.transform);
}
