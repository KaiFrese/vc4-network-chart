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

    const svgGroup = chartSVG.append('g');
    let zoom = d3.zoom().on('zoom', handleZoomAndPan);
    chartSVG.call(zoom);
    zoom.scaleTo(chartSVG, 0.3);

    let simulation = undefined;

    document.getElementById('file-input').addEventListener('change', () => {
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length > 0) {
            fileReader.readAsText(fileInput.files[0]);
        }
    });

    fileReader.addEventListener('load', () => {
        let data = d3.tsvParse(fileReader.result, d3.autoType);

        if (data.length > 0) {
            networkData = createNetworkData(data);
            networkData = updateSearchSelection(networkData, searchString);

            simulation = drawChart(svgGroup, networkData);
        }
    });

    document
        .getElementById('search-input')
        .addEventListener('keyup', (event) => {
            if (simulation !== undefined) {
                simulation.simulation.stop();
            }

            searchString = event.target.value;
            networkData = updateSearchSelection(
                networkData,
                searchString,
                simulation,
            );

            simulation.link.style(
                'stroke-width',
                (data) => data.weight * 100 + MIN_LINE_WIDTH,
            );

            simulation.node.style('fill', (data) =>
                data.isActive ? NODE_ACTIVE_COLOR : NODE_INACTIVE_COLOR,
            );

            if (simulation !== undefined) {
                simulation.simulation.restart();
            }
        });
});

function createNetworkData(data) {
    let networkData = { nodes: [], links: [] };
    const keys = Object.keys(data[0]);

    data = normalizeParameter(data, keys[2]);

    data.forEach((line) => {
        source = networkData.nodes.find((node) => line[keys[0]] === node.name);
        target = networkData.nodes.find((node) => line[keys[1]] === node.name);

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
            source: source,
            target: target,
            weight: line[keys[2]],
        });

        source.linkCount++;
        target.linkCount++;
    });

    networkData.nodes = normalizeParameter(networkData.nodes, 'linkCount');

    return networkData;
}

function updateSearchSelection(data, searchString) {
    data.links.forEach((link) => (link.isActive = false));

    data.nodes.forEach((node) => {
        const isActive = node.name.includes(searchString);
        node.isActive = isActive;

        if (isActive) {
            const connectedLinks = data.links.filter(
                (link) =>
                    link.target.id === node.id || link.source.id === node.id,
            );

            connectedLinks.forEach((link) => (link.isActive = true));
        }
    });

    return data;
}

function handleZoomAndPan(event) {
    d3.select('svg g').attr('transform', event.transform);
}

function normalizeParameter(data, key) {
    const minMax = data.reduce(
        (acc, dataRow) => {
            if (dataRow[key] < acc.min) {
                acc.min = dataRow[key];
            }

            if (dataRow[key] > acc.max) {
                acc.max = dataRow[key];
            }

            return acc;
        },
        { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
    );

    return data.map((dataRow) => {
        dataRow[key] = (dataRow[key] - minMax.min) / (minMax.max - minMax.min);
        return dataRow;
    });
}
