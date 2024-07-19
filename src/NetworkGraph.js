import * as d3 from "d3";


function NetworkGraph(data){
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select('svg').attr('width', width).attr('height', height);
    
    //charge is global force, effects all nodes, makes nodes effect eachother
    //center moves nodes to center of svg
    const simulation = d3.forceSimulation().force('charge', d3.forceManyBody().strength(-20)).force('center', d3.forceCenter(width/2, height/2));

    return(
        <div>
            <svg>

            </svg>
        </div>
    )
}

export default NetworkGraph;
