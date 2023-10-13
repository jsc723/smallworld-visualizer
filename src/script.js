const svgContainer = d3.select('#graph-container');

// Set initial SVG dimensions
const svgWidth = window.innerWidth - 50;
const svgHeight = window.innerHeight - 50;

const svg = svgContainer.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Calculate the center of the SVG
const centerX = svg.attr('width') / 2 - 100;
const centerY = svg.attr('height') / 2 - 100;

let initialLinkStrength = 0.5; // Adjust this as needed

// Create a function to calculate the link force strength based on the number of nodes
function calculateLinkStrength() {
    // Calculate a scaling factor based on the number of nodes
    const scalingFactor = Math.min(1, nodes.length / 100);

    // Calculate the adjusted link force strength
    return initialLinkStrength * scalingFactor;
}

// Create sample data
const nodes = [{ id: 1, x: centerX, y: centerY, cardData: {name: 'a', level: 1} },
{ id: 2, x: centerX+100, y: centerY+100,cardData: {name: 'a', level: 2} },
{ id: 3, x: centerX-100, y: centerY-100, cardData: {name: 'a', level: 3} }];


const links = [{ source: nodes[0], target: nodes[1] }, { source: nodes[1], target: nodes[2] }];

console.log(nodes, links)
var link = svg.selectAll('.link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

var node = svg.selectAll('.node')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr('r', 20)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded));

const linkForce = d3.forceLink().strength(calculateLinkStrength()).id((d) => d.id);

// Define the simulation for physics-based layout
const simulation = d3.forceSimulation()
    .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2).strength(1.0))
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('link', linkForce)
    .on('tick', ticked);


// Add nodes and edges to the simulation
simulation.nodes(nodes);
simulation.force('link').links(links);

function ticked() {
    link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

    node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
}

function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
var db = [{"Ruby": "にんじゃマスターハンゾー", "Name": "忍者マスターHANZO", "Attribute": "闇", "Level": "4", "Type": "\r戦士", "Attack": "1800", "Defense": null}, {"Ruby": "にんじん", "Name": "にん人", "Attribute": "闇", "Level": "4", "Type": "\r植物", "Attack": "1900", "Defense": null}, {"Ruby": "ニードルガンナー", "Name": "ニードル・ガンナー", "Attribute": "地", "Level": "1", "Type": "\r機械", "Attack": "100", "Defense": null}, {"Ruby": "ニードルギルマン", "Name": "ニードル・ギルマン", "Attribute": "水", "Level": "3", "Type": "\r海竜", "Attack": "1300", "Defense": null}, {"Ruby": "ニードルバンカー", "Name": "ニードルバンカー", "Attribute": "闇", "Level": "5", "Type": "\r機械", "Attack": "1700", "Defense": null}]
// Function to load and parse JSON data from a file
function loadData() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            // Handle the parsed data here
            db = data;
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('Fetch error:', error);
        });
}

// Call the function to load and parse the JSON data
// loadData();



document.addEventListener('DOMContentLoaded', function () {
    // Select the button element
    const addButton = document.getElementById('add-node-button');
    console.log(addButton)
    // Event listener for adding a new node and connecting it to node with id=2
    addButton.addEventListener('click', () => {
        // Calculate the center (average position) of all nodes
        const center = nodes.reduce(
            (accumulator, node) => {
                accumulator.x += node.x;
                accumulator.y += node.y;
                return accumulator;
            },
            { x: 0, y: 0 }
        );

        center.x /= nodes.length;
        center.y /= nodes.length;
        // Generate a new node with a unique ID
        const newNode = { id: nodes.length + 1, x: center.x, y: center.y, cardData: {name: 'b', level: nodes.length+1}  };

        // Push the new node to the nodes array
        nodes.push(newNode);

        const selectedNodes = nodes.filter(node => node.cardData.level % 2 === 0);
        console.log(selectedNodes)
        selectedNodes.forEach(node => {
            console.log('node: ',  node)
            const newEdge = { source: newNode, target: node };
            links.push(newEdge);
            const newEdgeElement = svg
                .append('line')
                    .attr('class', 'link')
                    .attr('x1', newNode.x)
                    .attr('y1', newNode.y)
                    .attr('x2', node.x)
                    .attr('y2', node.y);
        })

        // Append a new circle for the new node
        const newNodeElement = svg
        .append('circle')
            .attr('class', 'node')
            .attr('r', 20)
            .attr('cx', newNode.x)
            .attr('cy', newNode.y)
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragging)
                .on('end', dragEnded));

        link = svg.selectAll('.link').data(links)
        node = svg.selectAll('.node').data(nodes)

        linkForce.strength(calculateLinkStrength());

        // Update the simulation to consider the new node and edge
        simulation.nodes(nodes);
        simulation.force('link').links(links);
        simulation.alpha(1).restart();
    });

    document.getElementById('search-button').addEventListener('click', performSearch);

    function performSearch() {
        const query = document.getElementById('search-input').value;

        // Initialize an array to store the results
        const topResults = [];
        const numMaxResults = 20;

        for (const item of db) {
            if (item.Name.includes(query)) {
                topResults.push(item);
                if (topResults.length >= numMaxResults) {
                    break;
                }
            }
        }
        console.log(topResults);
        displaySearchResults(topResults);
    }

    function handleResultClick(event) {
        // Retrieve the associated object from the data attribute
        const objectData = JSON.parse(event.currentTarget.getAttribute('data-object'));
    
        // Do something with the associated object
        console.log('Clicked result data:', objectData);
    }
//ニードル
    function displaySearchResults(results) {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
        } else {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.textContent = result.Name;
                
                const buttonElement = document.createElement('button');
                buttonElement.textContent = 'Add';
                buttonElement.setAttribute('data-object', JSON.stringify(result));
                buttonElement.addEventListener('click', handleResultClick);
    
                resultElement.appendChild(buttonElement);
                resultsDiv.appendChild(resultElement);
            });
        }
    }

});

