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
var nextId = 1
function getNewId() {
    return nextId++;
}
// Create sample data
let nodes = [];


let links = [];

var link = svg.selectAll('.link')
    .data(links);

var node = svg.selectAll('.node')
    .data(nodes);

// Create a selection for the text elements
var textElements = svg.selectAll('.node-label')
    .data(nodes);


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

    
    textElements
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
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
var db = []
// Function to load and parse JSON data from a file
function loadData() {
    fetch('https://raw.githubusercontent.com/jsc723/smallworld-visualizer/master/src/constants/cards-cn.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            // Handle the parsed data here
            db = data;
            console.log('database loaded')
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('Fetch error:', error);
        });
}

// Call the function to load and parse the JSON data
loadData();


function hasEdge(card1, card2) {
    let x = 0
    if (card1.Attack == card2.Attack) {
        x += 1
    }
    if (card1.Defense == card2.Defense) {
        x += 1
    }
    if (card1.Attribute == card2.Attribute) {
        x += 1
    }
    if (card1.Level == card2.Level) {
        x += 1
    }
    if (card1.Type == card2.Type) {
        x += 1
    }
    return x === 1
}


document.addEventListener('DOMContentLoaded', function () {

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

    function handleButtonAddClick(event) {
        // Retrieve the associated object from the data attribute
        const objectData = JSON.parse(event.currentTarget.getAttribute('data-object'));
    
        // Do something with the associated object
        console.log('Clicked result data:', objectData);
        if (nodes.find(node => node.cardData.Name === objectData.Name)) {
            return;
        }

        // Calculate the center (average position) of all nodes
        const center = nodes.reduce(
            (accumulator, node) => {
                accumulator.x += node.x;
                accumulator.y += node.y;
                return accumulator;
            },
            { x: 0, y: 0 }
        );

        center.x = center.x / nodes.length + 5*Math.random();
        center.y = center.y / nodes.length + 5*Math.random();
        // Generate a new node with a unique ID
        const newNode = { id: getNewId(), x: center.x, y: center.y, cardData: objectData  };

        // Push the new node to the nodes array
        nodes.push(newNode);

        const selectedNodes = nodes.filter(node => hasEdge(node.cardData, newNode.cardData));
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

        // Add text elements for new nodes
        const textElem = svg
        .append('text')
        .attr('class', 'node-label') // Add a class to style the text
        .attr('x', newNode.x) // Set the x-coordinate based on your node data
        .attr('y', newNode.y) // Set the y-coordinate based on your node data
        .text(newNode.cardData.Name) // Set the text content to the node's name
        .attr('text-anchor', 'middle') // Center the text on the node
        .attr('dy', '0.3em'); // Adjust the vertical position if needed

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
        textElements = svg.selectAll('.node-label').data(nodes)

        linkForce.strength(calculateLinkStrength());

        // Update the simulation to consider the new node and edge
        simulation.nodes(nodes);
        simulation.force('link').links(links);
        simulation.alpha(1).restart();

    }

    function handleButtonDeleteClick(event) {
        // Retrieve the associated object from the data attribute
        const objectData = JSON.parse(event.currentTarget.getAttribute('data-object'));
    
        // Do something with the associated object
        console.log('Clicked result data:', objectData);
        const toRemove = nodes.find(node => node.cardData.Name === objectData.Name)
        if (!toRemove) {
            return;
        }

        const nodeId = toRemove.id;


        // Remove the node by filtering the data
        nodes = nodes.filter(node => node.id !== nodeId);

        // Remove associated links by filtering the data
        links = links.filter(link => link.source.id !== nodeId && link.target.id !== nodeId);


        svg.selectAll('.link').filter(d => d.source.id === nodeId || d.target.id === nodeId).remove()
        svg.selectAll('.node').filter(d => d.id === nodeId).remove()
        svg.selectAll('.node-label').filter(d => d.id === nodeId).remove()

        link = svg.selectAll('.link')
        node = svg.selectAll('.node').data(nodes)
        textElements = svg.selectAll('.node-label').data(nodes)

        linkForce.strength(calculateLinkStrength());

        // Update the simulation to consider the new node and edge
        simulation.nodes(nodes);
        simulation.force('link').links(links);
        simulation.alpha(1).restart();

    }

    function displaySearchResults(results) {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
        } else {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.textContent = result.Name;

                const buttonAddElement = document.createElement('button');
                buttonAddElement.textContent = 'Add';
                buttonAddElement.setAttribute('data-object', JSON.stringify(result));
                buttonAddElement.addEventListener('click', handleButtonAddClick);

                const buttonDeleteElement = document.createElement('button');
                buttonDeleteElement.textContent = 'Delete';
                buttonDeleteElement.setAttribute('data-object', JSON.stringify(result));
                buttonDeleteElement.addEventListener('click', handleButtonDeleteClick);
    
                resultElement.appendChild(buttonAddElement);
                resultElement.appendChild(buttonDeleteElement);
                resultsDiv.appendChild(resultElement);
            });
        }
    }

});

