const svgContainer = d3.select('#graph-container');

// Set initial SVG dimensions
console.log(window.innerWidth, window.innerHeight)
const svg = svgContainer.append('svg')
    .classed("bounded-svg", true)

// Calculate the center of the SVG
const centerX = svg.node().getBoundingClientRect().width / 2;
const centerY = svg.node().getBoundingClientRect().height / 2;

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

var selectedNodeCount = 0;


const linkForce = d3.forceLink().strength(calculateLinkStrength()).id((d) => d.id);

// Define the simulation for physics-based layout
const simulation = d3.forceSimulation();
function enableSimulationForce() {
    linkForce.strength(calculateLinkStrength());
    simulation.force('center', d3.forceCenter(svg.node().getBoundingClientRect().width / 2, svg.node().getBoundingClientRect().height / 2).strength(1.0))
    .force('charge', d3.forceManyBody().strength(-750))
    .force('link', linkForce)
    .on('tick', ticked);
}
enableSimulationForce();



function disableSimulationForce() {
    linkForce.strength(0);
    simulation.force('link').strength(0);
    simulation.force('center').strength(0)
    simulation.force('charge').strength(0);
}




// Add nodes and edges to the simulation
simulation.nodes(nodes);
simulation.force('link').links(links);

function ticked() {

    nodes.forEach(node => {
        node.x = Math.max(20, Math.min(svg.node().getBoundingClientRect().width - 20, node.x));
        node.y = Math.max(20, Math.min(svg.node().getBoundingClientRect().height - 20, node.y));
    });

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

// db now defined in cards-*.js

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


    document.getElementById('clear-btn').addEventListener('click', () => clearGraph());
    document.getElementById('import-btn').addEventListener('click', () => importJSON());
    document.getElementById('export-btn').addEventListener('click', () => exportJSON());
    const forceCheckbox = document.getElementById('force-checkbox');
    forceCheckbox.addEventListener('change', () => {
        if (forceCheckbox.checked) {
            enableSimulationForce();
            restartSimulation();
        } else {
            disableSimulationForce();
        }
    });

    window.addEventListener("resize", () => {
        const svgWidth = svg.node().getBoundingClientRect().width;
        const svgHeight = svg.node().getBoundingClientRect().height;
        simulation.force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2).strength(1.0));
        restartSimulation();
    })

    function restartSimulation(){
        if (forceCheckbox.checked) {
            linkForce.strength(calculateLinkStrength());
            simulation.force('link').links(links);
        }
    
        // Update the simulation to consider the new node and edge
        simulation.nodes(nodes);
        simulation.alpha(1).restart();
    
        node.classed("bridge-node", false).classed("reachable-node", false);
        node.classed("selected-node", false);
        selectedNodeCount = 0;
    }


    const deleteNodeBtn = document.getElementById('delete-node-button');
    deleteNodeBtn.addEventListener('click', () => deleteNodeBtnClicked());
    
    const searchBridgeBtn = document.getElementById('search-bridge-button');
    searchBridgeBtn.addEventListener('click', () => searchBridge());

    // Add an event listener to the input field for the "keydown" event
    document.getElementById('search-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            // Check if the pressed key is "Enter"
            event.preventDefault(); // Prevent the default behavior (form submission)
            performSearch();
        }
    });

    document.getElementById("search-input").addEventListener("input", performSearch);
    document.getElementById('help-link').addEventListener('click', () => {
        alert(help_msg);
    });

    function performSearch() {
        const query = document.getElementById('search-input').value;
        // Initialize an array to store the results
        const topResults = [];
        const numMaxResults = 30;

        for (const item of db) {
            if (item.Name.includes(query) 
                || (!!item.Ruby && item.Ruby.includes(query))
                || (!!item.MDName && item.MDName.includes(query))) {
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
        const svgWidth = svg.node().getBoundingClientRect().width;
        const svgHeight = svg.node().getBoundingClientRect().height;
        const xNew = (0.2 + 0.6*Math.random()) * svgWidth;
        const yNew = (0.2 + 0.6*Math.random()) * svgHeight;
        // Generate a new node with a unique ID
        const newNode = { id: getNewId(), x: xNew, y: yNew, cardData: objectData };
        console.log("new node:", newNode)

        // Push the new node to the nodes array
        nodes.push(newNode);

        const selectedNodes = nodes.filter(node => hasEdge(node.cardData, newNode.cardData));
        console.log(selectedNodes)
        selectedNodes.forEach(node => {
            console.log('node: ', node)
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
                .on('end', dragEnded))
            .on('contextmenu', nodeRightClicked);

        link = svg.selectAll('.link').data(links)
        node = svg.selectAll('.node').data(nodes)
        textElements = svg.selectAll('.node-label').data(nodes)

        restartSimulation();

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
        removeNodeById(toRemove.id);
    }

    function removeNodeById(nodeId) {
        deleteNodeBtn.classList.add('invisible');
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

        restartSimulation();
    }

    function displaySearchResults(results) {
        const resultsDiv = document.getElementById('search-results');
        resultsDiv.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
        } else {
            const table = document.createElement('table');
            results.forEach(result => {
                const row = document.createElement('tr');

                const addButtonCell = document.createElement('td');
                const buttonAddElement = document.createElement('button');
                buttonAddElement.textContent = '+';
                buttonAddElement.setAttribute('data-object', JSON.stringify(result));
                buttonAddElement.addEventListener('click', handleButtonAddClick);
                buttonAddElement.classList.add("s_button_search_result");
                addButtonCell.appendChild(buttonAddElement);

                const delButtonCell = document.createElement('td');
                const buttonDeleteElement = document.createElement('button');
                buttonDeleteElement.textContent = '-';
                buttonDeleteElement.setAttribute('data-object', JSON.stringify(result));
                buttonDeleteElement.addEventListener('click', handleButtonDeleteClick);
                buttonDeleteElement.classList.add("s_button_search_result");
                delButtonCell.appendChild(buttonDeleteElement);

                            // Create a table data cell for each piece of data
                const cell1 = document.createElement('td');
                cell1.classList.add('table-cell');
                cell1.textContent = result.Name;

                const cell2 = document.createElement('td');
                cell2.classList.add('table-cell');
                cell2.textContent = `Lv${result.Level}`;

                const cell3 = document.createElement('td');
                cell3.classList.add('table-cell');
                const attr_text = map_cdb_attribute(result.Attribute);
                cell3.textContent = attr_text;

                const cell4 = document.createElement('td');
                cell4.classList.add('table-cell');
                const type_text = map_cdb_race(result.Type);
                cell4.textContent = type_text;

                const cell5 = document.createElement('td');
                cell5.classList.add('table-cell');
                cell5.textContent = `${result.Attack}/${result.Defense}`;

                const buttonsWidget = document.createElement('td')
                buttonsWidget.classList.add('table-cell');
                buttonsWidget.appendChild(addButtonCell);
                buttonsWidget.appendChild(delButtonCell);

                row.appendChild(buttonsWidget);
                row.appendChild(cell1);
                row.appendChild(cell2);
                row.appendChild(cell3);
                row.appendChild(cell4);
                row.appendChild(cell5);

                table.appendChild(row);
            });
            resultsDiv.appendChild(table)
        }
    }

    function clearGraph() {
        svg.selectAll('.link').remove()
        svg.selectAll('.node').remove()
        svg.selectAll('.node-label').remove()
        node = svg.selectAll('.node')
        link = svg.selectAll('.link')
        textElements = svg.selectAll('.node-label')

        nodes = []
        links = []
        restartSimulation();
    }

    // Function to download JSON data as a file
    function exportJSON() {
        // Create a JSON object (or use an existing one)
        const jsonData = {
            nodes: nodes,
            links: links.map((link) => {
                return {
                    source: link.source.id, 
                    target: link.target.id
                }
            })
        };

        // Convert the JSON object to a string
        const jsonString = JSON.stringify(jsonData, null, 2);

        // Create a Blob (Binary Large Object) from the JSON string
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary link element for downloading
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json'; // Specify the filename for the downloaded file
        a.style.display = 'none';

        // Append the link to the document and trigger a click event to initiate the download
        document.body.appendChild(a);
        a.click();

        // Clean up: remove the temporary link and revoke the Blob URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function updateGraph() {
        link = svg.selectAll('.link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    
        textElements = svg.selectAll('.node-label')
            .data(nodes)
            .enter()
            .append('text')
            .attr('class', 'node-label') // Add a class to style the text
            .attr('x', d => d.x) // Set the x-coordinate based on your node data
            .attr('y', d => d.y) // Set the y-coordinate based on your node data
            .text(d => d.cardData.Name) // Set the text content to the node's name
            .attr('text-anchor', 'middle') // Center the text on the node
            .attr('dy', '0.3em'); // Adjust the vertical position if needed

        node = svg.selectAll('.node')
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
                .on('end', dragEnded))
            .on('contextmenu', nodeRightClicked);

        restartSimulation();
    }

    function importJSON() {
        const fileInput = document.getElementById('fileInput');

        // Check if a file is selected
        if (fileInput.files.length > 0) {
            clearGraph();
            console.log('hello')
            const selectedFile = fileInput.files[0];
            const reader = new FileReader();

            // Set up a callback function for when the file is loaded
            reader.onload = function(event) {
                console.log(event.target.result);

                let data = JSON.parse(event.target.result);
                nodes = data.nodes;
                nodes.forEach(d => {
                    nextId = Math.max(nextId, d.id + 1)
                });
                links = data.links.map(link => {
                    return {
                        source: nodes.find(n => n.id === link.source),
                        target: nodes.find(n => n.id === link.target)
                    }
                });
                console.log(nodes, links)
                updateGraph();
            };
            reader.readAsText(selectedFile);
        }
    }

    function deleteNodeBtnClicked() {
        const selectedCards = [];
        svg.selectAll("[class*='selected-node']").each((d) => {
            selectedCards.push(d.cardData);
        })
        if (selectedCards.length !== 1) {
            console.log(selectedCards)
            throw new Error("Selected node count is not 1")
        }
        const toRemove = nodes.find(n => n.cardData.Name === selectedCards[0].Name);
        if (!toRemove) {
            return;
        }
        removeNodeById(toRemove.id);
    }

    function searchBridge() {
        document.getElementById("search-input").value = "";
        document.getElementById("search-results").innerHTML = "";

        const selectedCards = [];
        svg.selectAll("[class*='selected-node']").each((d) => {
            selectedCards.push(d.cardData);
        })

        if (selectedCards.length < 2) {
            console.log(selectedCards)
            throw new Error("Selected node count is smaller than 2")
        }

        let candidates = new Map();

        for (const item of db) {
            if (hasEdge(selectedCards[0], item)) {
                candidates.set(item.Name, item);
            }
        }

        for(let i = 1; i < selectedCards.length; i++) {
            const nextCandidates = new Map();
            for (const [name, item] of candidates) {
                if (hasEdge(selectedCards[i], item)) {
                    nextCandidates.set(name, item);
                }
            }
            candidates = nextCandidates;
        }

        const results = Array.from(candidates.values());

        displaySearchResults(results, true);
    }


    function nodeRightClicked(event, d) {
        event.preventDefault(); // Prevent the default right-click context menu
                        
        // Your custom function to run when right-clicking a circle
        console.log('node right clicked', d.id)
        let graph = new Map();
        links.forEach(e => {
            if (graph.has(e.source.id)) {
                graph.get(e.source.id).push(e.target.id)
            } else {
                graph.set(e.source.id, [e.target.id])
            }
            if (graph.has(e.target.id)) {
                graph.get(e.target.id).push(e.source.id)
            } else {
                graph.set(e.target.id, [e.source.id])
            }
        });
        
        let clickedNode = node.filter(nodeData => nodeData.id == d.id);
        if (clickedNode.classed("selected-node")) {
            selectedNodeCount--;
            clickedNode.classed("selected-node", false);
            node.classed("bridge-node", false).classed("reachable-node", false);
            searchBridgeBtn.classList.add("invisible");
            if (selectedNodeCount !== 1) {
                deleteNodeBtn.classList.add('invisible');
            }
        } 
        else {
            node.classed("bridge-node", false).classed("reachable-node", false);
            clickedNode.classed("selected-node", true);
            ++selectedNodeCount;
        }
        
        if(selectedNodeCount > 1) {
            deleteNodeBtn.classList.add('invisible');
            searchBridgeBtn.classList.remove("invisible");
            const selectedIds = [];
            svg.selectAll("[class*='selected-node']").each((d) => {
                selectedIds.push(d.id);
            })
            
            for(const [k, v] of graph) {
                if(selectedIds.every(item => v.includes(item))) {
                    //this is a bridge
                    node.filter(nodeData => nodeData.id == k).classed("bridge-node", true);
                }
            }
        } else if (selectedNodeCount === 1) {
            deleteNodeBtn.classList.remove('invisible');
            searchReachable(graph);
        }

    }

    function searchReachable(graph){
        node.classed("bridge-node", false).classed("reachable-node", false);
        let queue = []
        svg.selectAll("[class*='selected-node']").each((d) => {
            queue.push(d.id);
        });
        if (queue.length !== 1) {
            console.log(selectedIds)
            throw new Error("Selected node count is not 1")
        }
        const sourceId = queue[0];

        
        let k = 2;
        while(queue.length > 0 && k > 0) {
            k--;
            const levelSize = queue.length;
            for(let t = 0; t < levelSize; t++) {
                let v = queue.shift();
                graph.get(v).forEach(u => {
                    if (u !== sourceId) {
                        queue.push(u);
                    }
                })
            }
        }

        queue = [...new Set(queue)];
        node.filter(d => queue.includes(d.id)).classed("reachable-node", true);
    }

});

