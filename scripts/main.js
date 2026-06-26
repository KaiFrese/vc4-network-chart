('use strict');

const UNDEFINED_VALUE = 'NA'; //TODO: make changeable for different dataset

document.addEventListener('DOMContentLoaded', async () => {
    const fileReader = new FileReader();
    let networkData;
    let searchString = '';

    const chartSVG = d3
        .select('#chart-svg-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${SVG_SIZE} ${SVG_SIZE}`);

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
                    };
                    networkData.nodes.push(source);
                }

                if (target === undefined) {
                    target = {
                        name: line[keys[1]],
                        id: networkData.nodes.length,
                    };
                    networkData.nodes.push(target);
                }

                networkData.links.push({
                    source: source.id,
                    target: target.id,
                });
            });

            networkData = updateSearchSelection(networkData, searchString);

            drawChart(chartSVG, networkData);
        }
    });

    document
        .getElementById('search-input')
        .addEventListener('keyup', (event) => {
            searchString = event.target.value;

            networkData = updateSearchSelection(networkData, searchString);

            drawChart(chartSVG, networkData);
        });
});

function updateSearchSelection(data, searchString) {
    //Todo

    return data;
}
