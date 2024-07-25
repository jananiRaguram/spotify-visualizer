import * as d3 from "d3";
import { useEffect, useRef } from "react";


//by track
// nodes are tracks, links are artists, colour is popularity; force is by popularity

//by artist
//nodes are artists, links are genre, colour is popularity 

function NetworkGraph({data}){
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svgRef = useRef(null);

    useEffect(() => {

        if(!data){
            console.log("empty");
            return;
        }
        
        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
        
        console.log(data);
        //charge is global force, effects all nodes, makes nodes effect eachother
        //center moves nodes to center of svg

        const simulation = d3.forceSimulation(data.nodes)
                            .force('link', d3.forceLink(data.links).id(d => d.name).distance(200))
                            .force('charge', d3.forceManyBody().distanceMax(height/2).strength(-400))
                            .force('center', d3.forceCenter(width/2, height/2))
                            .force('collide', d3.forceCollide().iterations(10));
      
        const nodeElements = svg.append('g')
                            .selectAll('circle')
                            .data(data.nodes)
                            .enter().append('circle')
                            .attr('r', node => node.group/5) //fix radius scale
                            .call(dragDrop(simulation))
        
        nodeElements.append('title').text(d => d.name);
                        
        const textElements = svg.append('g')
                            .selectAll('text')
                            .data(data.nodes)
                            .enter().append('text')
                                .text(node => node.name)
                                .attr('font-size', 15)
                                .attr('dx', 15)
                                .attr('dy', 4)
        

        const linkElements = svg.append('g')
                                .selectAll('line')
                                .data(data.links)
                                .enter().append('line')
                                        .attr('stroke-width', 1)
                                        .attr('stroke', 'black');
       
        simulation.nodes(data.nodes).on('tick', () => {
            nodeElements.attr('cx', node => node.x)
                        .attr('cy', node => node.y);

            textElements.attr('x', node => node.x)
                        .attr('y', node => node.y);

            linkElements.attr('x1', node => node.source.x)
                        .attr('y1', node => node.source.y)
                        .attr('x2', node => node.target.x)
                        .attr('y2', node => node.target.y);

        });
    
        function dragDrop(simulation){
            return d3.drag()
                        .on('start', node => {
                            node.fx = node.x;
                            node.fy = node.y;
                        })
                        .on('drag', (event,node) => {
                            simulation.alphaTarget(0.7).restart();
                            node.fx = event.x;
                            node.fy = event.y;
                        })
                        .on('end', (event, node) => {
                            if(!event.active){
                                simulation.alphaTarget(0);
                            }
                            node.fx = null;
                            node.fy = null;
                        });
        }

        function getRelated(node){
            return data.links.reduce((related, link) => {
                if(link.target.name === node.name){
                    related.push(link.source.name);
                }else if(link.source.name === node.name){
                    related.push(link.target.name);
                }
                return related
            }, [node.name])
        }

        function isRelated(node, link){
            return link.target.name === node.name || link.source.name === node.name;
        }

        function selectNode(selectedNode){

        }

    }, [data]);

    

    return(
        <div>
            <svg ref={svgRef}></svg>
        </div>
    )
}

export default NetworkGraph;
