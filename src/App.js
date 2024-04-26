import './App.css';
import { Container, Box, Typography, Button, ButtonGroup, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FindInPageIcon from '@mui/icons-material/FindInPage';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { useState, useEffect } from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { ForceGraph3D } from 'react-force-graph';
import { PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from 'recharts';

function App() {

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                /* main: '#f9d10c',
                light: '#fae642',
                dark:  '#f8b800', */
                main: '#f77d7d',
                light: '#ff9181',
                dark: '#ff9181'
            },
            secondary: {
                main: '#fcca81',
                light: '#fef3e0',
                dark: '#f68f8c'
            }
        }
      });
      
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });

    //const [rdfFile, setRDFFile] = useState('');

    const [outputData, setOutputData] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Filename:", files[0].name);
        const formData = new FormData();
        formData.append('rdfFile', files[0]);

        fetch('http://localhost:8000/preprocessFiles/', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log("Data", data);
            
            const arr = data.Data; // Assuming Data is the property containing the array

            if (Array.isArray(arr)) {
                let tempVar = ''
                arr.forEach((item, index) => {
                    tempVar += `Subject: ${item.Subject}, Predicate: ${item.Predicate}, Object: ${item.Object}\n`;
                }); 
                setOutputData(tempVar);
            }

        }) 
        .catch(error => console.error('Error:', error));        
    };

    //const [originalFile, setOriginalFile] = useState('');

    const [files, setFiles] = useState([]);

    const [enableDownload, setEnableDownload] = useState(false);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]); //Breaking down FileList object to an array
    };

    useEffect(() => {
        console.log(files);
    }, [files]);

    const [graphData, setGraphData] = useState({});

    const [queriedNode, setQueriedNode] = useState([]);

    const [initialDataProcessed, setDataProcessed] = useState(false);

    let nodeName;

    const [duplicateCount, setDuplicateCount] = useState(0);

    //const [generateGraph, setGenerateGraph] = useState(false);

    const handleGraphGeneration = (e) => {
        e.preventDefault();
        console.log("Node Name: ", nodeName);
        console.log(graphData)
        //console.log("Links: ", graphData.links)

        //const relationList = ['hasName', 'hasAge', 'hasGender', 'hasBloodGroup', 'hasBloodPressure', 'hasCholestrol', 'hasHeartRate', 'isDisabled', 'hasDiagnosis'];

        const queriedNodeList = graphData.links
            .filter(link => link.target.id === nodeName)
            .map(link => link.source.id);
        console.log("Queried Node List: ", queriedNodeList);
        setQueriedNode(queriedNodeList);
        // console.log("Queried Node: ", queriedNode);

    }

    const handlePreprocessSubmit = (e) => {
        e.preventDefault();
        setOutputData('');
        setPreprocessingInitiated(true);
        //console.log("Filename", originalFile.name);
        const formData = new FormData();
        //formData.append('originalFile', originalFile);
        files.forEach((file, index) => {
            formData.append(`originalFile${index + 1}`, file);
        });

        fetch('http://localhost:8000/preprocessFiles/', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            /*
             */
            // let graphDataArray = Object.entries(data).map(([name, graphData]) => ({ name, ...graphData }));
            console.log("Status: ", data);
            setEnableDownload(true);
            processData(data);
            setGraphData(data.graph_data);
        }) 
        .catch(error => console.error('Error:', error));        
    };

    const [genderData, setGenderData] = useState([]);
    const [ageData, setAge] = useState([]);
    const [bloodGroupData, setBloodGroup] = useState([]);
    const [bloodPressureData, setBloodPressure] = useState([]);
    const [cholestrolData, setCholestrol] = useState([]);
    const [heartRateData, setHeartRate] = useState([]);
    const [disabilityData, setDisability] = useState([]);
    const [diagnosisData, setDiagnosisData] = useState([]);
    const [semanticData, setSemanticData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [preprocessingInitiated, setPreprocessingInitiated] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 10000)
    }, [initialDataProcessed]);

    const processData = (data) => {
        setDuplicateCount(data.duplicate_count);
        setGenderData(Object.entries(data.gender_dict).map(([name, value]) => ({name, value})));
        setAge(data.age_dict);
        setBloodGroup(Object.entries(data.bloodgroup_dict).map(([name, value]) => ({name, value})));
        setBloodPressure(Object.entries(data.bloodpressure_dict).map(([name, value]) => ({name, value})));
        setCholestrol(data.cholestrol_dict);
        setHeartRate(data.hr_dict);
        setDisability(Object.entries(data.divyang_dict).map(([name, value]) => ({name, value})));
        setDiagnosisData(Object.entries(data.diagnosis_dict).map(([name, value]) => ({name, value})));
        setSemanticData(data.semantic_merge_dict);
        setDataProcessed(true);
    }

    return (
        <>  
            <ThemeProvider theme={darkTheme}>
                <CssBaseline/>
                <Container 
                    maxWidth={false}
                    sx={{
                        minHeight: '100vh',
                        backgroundImage: 'linear-gradient(to bottom, #232526, #414345)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflowX: 'hidden'
                    }}
                >
                    <Typography 
                        variant='h2'
                        align='center'
                        sx={{
                            my: 2,
                            background: "-webkit-linear-gradient(45deg, #C6FFDD, #FBD786, #f7797d)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}
                    >
                        Ontology Data Integration
                    </Typography>
                    <Box 
                        sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2,
                            my: 2
                        }}
                    >
                        <ButtonGroup 
                            sx={{ 
                                width: '50%',
                                
                            }}
                        >
                            <Button 
                                component="label"
                                htmlFor='rdf-input'
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    background: 'linear-gradient(45deg, #C6FFDD, #FBD786, #f7797d)',
                                }}
                            >
                                Upload file
                                {/* <VisuallyHiddenInput id='rdf-input' type="file" onChange={(e) => setRDFFile(e.target.files[0])}/> */}
                                <VisuallyHiddenInput id='rdf-input' type="file" multiple onChange={handleFileChange}/>
                            </Button>
                            {/* <Button component="label" htmlFor='rdf-input' variant="outlined" sx={{ flexGrow: 1, }}>{rdfFile.name}</Button> */}
                            <Button component="label" htmlFor='rdf-input' variant="outlined" sx={{ flexGrow: 1, }}>
                                {files.map(file => file.name).join(', ')}
                            </Button>
                        </ButtonGroup>
                        <Button 
                            variant='contained'
                            color='secondary'
                            onClick={(e) => handleSubmit(e)}
                            endIcon={<FindInPageIcon/>}
                            
                        >
                            Process File
                        </Button>
                        <Button 
                            variant='contained'
                            color='secondary'
                            onClick={(e) => handlePreprocessSubmit(e)}
                            endIcon={<FindInPageIcon/>}
                            
                        >
                            Preprocess File
                        </Button>
                    </Box>

                    {
                        preprocessingInitiated &&
                        <Box sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                            {/* <ForceGraph3D 
                                graphData={graphData}
                                nodeLabel={node => node.id}
                                linkLabel={link => link.relation}
                                linkColor={link => link.source.id === queriedNode || link.target.id === queriedNode ? 'yellow' : 'white'}
                                linkWidth={link => link.source.id === queriedNode || link.target.id === queriedNode ? 4 : 1} // make the links to the queried node wider
                                linkDirectionalParticles={link => link.source.id === queriedNode || link.target.id === queriedNode ? 100 : 0}
                                linkDirectionalParticleColor={link => link.source.id === queriedNode || link.target.id === queriedNode ? 'gold' : 'white'}
                                linkDirectionalParticleWidth={link => link.source.id === queriedNode || link.target.id === queriedNode ? 4 : 1}
                                linkDirectionalParticleSpeed={0.01}
                                nodeVal={node => node.id === queriedNode ? 250 : 1} // make the queried node larger
                                nodeColor={node => node.id === queriedNode ? 'purple' : 'violet'} // change the color of the queried node
                                onNodeDragEnd={node => {
                                    node.fx = node.x;
                                    node.fy = node.y;
                                    node.fz = node.z;
                                }}
                            /> */}
                            {!loading && (Object.keys(graphData).length > 0)?
                                <> 
                                    <ForceGraph3D 
                                        graphData={graphData}
                                        nodeLabel={node => node.id}
                                        linkLabel={link => link.relation}
                                        linkColor={link => queriedNode.includes(link.source.id) || queriedNode.includes(link.target.id) ? 'yellow' : 'white'}
                                        linkWidth={link => queriedNode.includes(link.source.id) || queriedNode.includes(link.target.id) ? 4 : 1} // make the links to the queried nodes wider
                                        linkDirectionalParticles={link => queriedNode.includes(link.source.id) || queriedNode.includes(link.target.id) ? 50 : 0}
                                        linkDirectionalParticleColor={link => queriedNode.includes(link.source.id) || queriedNode.includes(link.target.id) ? 'gold' : 'white'}
                                        linkDirectionalParticleWidth={link => queriedNode.includes(link.source.id) || queriedNode.includes(link.target.id) ? 4 : 1}
                                        linkDirectionalParticleSpeed={0.01}
                                        nodeVal={node => queriedNode.includes(node.id) ? 250 : 1} // make the queried nodes larger
                                        nodeColor={node => queriedNode.includes(node.id) ? 'purple' : 'violet'} // change the color of the queried nodes
                                        onNodeDragEnd={node => {
                                            node.fx = node.x;
                                            node.fy = node.y;
                                            node.fz = node.z;
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 2}}>
                                        <TextField id="node-input" label="Enter node to be queried" variant="outlined" onChange={(e) => { nodeName = e.target.value }}/>
                                        <Button onClick={handleGraphGeneration} > Submit Query </Button>    
                                    </Box> 
                                </> :
                                <CircularProgress />
                            }
                            
                        </Box>
                        
                        // (Object.keys(graphData).length > 0) &&
                        // <RDFGraph data={graphData} />
                    }
                    {/* <TextField id="node-input" label="Enter node to be queried" variant="outlined" onChange={(e) => { nodeName = e.target.value }}/>
                    <Button sx={{ margin: 1 }} onClick={handleGraphGeneration} > Submit Query </Button> */}
                    {queriedNode.length !== 0 && 
                        <>
                            <Typography 
                                variant='h4'
                                align='center'
                                sx={{
                                    my: 2,
                                    background: "-webkit-linear-gradient(45deg, #C6FFDD, #FBD786, #f7797d)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                Number of queried nodes: {queriedNode.length}
                            </Typography>
                            <Box display='flex' sx={{width: '95vw', overflowX: 'auto', justifyContent: 'space-evenly', gap: 2, alignItems: 'center', border: '2px solid white', borderRadius: '8px 8px 0px 0px', padding: 2, mt: 1}}>
                                {queriedNode.map((node) => (
                                    <Paper key={node} sx={{padding: 2}}>
                                        <Typography variant='h5' textAlign='center'>{node}</Typography>
                                        <ul>
                                            {graphData.links
                                                .filter(link => link.source.id === node || link.target.id === node)
                                                .map(link => {
                                                const connectedNode = link.source.id === node ? link.target : link.source;
                                                return (
                                                    <li key={connectedNode.id}>
                                                        {link.relation}: {connectedNode.id}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </Paper>
                                ))}
                            </Box>
                        </>
                    }
                    {initialDataProcessed &&
                         <> 
                            <Box display='flex' sx={{width: '80vw', justifyContent: 'space-between', m: 0, p: 0}}>  
                                <Typography 
                                    variant='h4'
                                    align='center'
                                    sx={{
                                        mt: 3,
                                        background: "-webkit-linear-gradient(45deg, #C6FFDD, #FBD786, #f7797d)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Duplicate Entries Merged: {duplicateCount}
                                </Typography>
                                <Typography 
                                    variant='h4'
                                    align='center'
                                    sx={{
                                        mt: 3,
                                        background: "-webkit-linear-gradient(45deg, #C6FFDD, #FBD786, #f7797d)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Semantic Heterogeneity Removed: {semanticData.mapped_count}
                                </Typography>
                            </Box>
                            <Box sx={{mt: 3, border: '2px solid white', borderRadius: 8, padding: 2}}>
                                <Typography
                                    variant='h4'
                                    align='center'
                                    sx={{
                                        mt: 1,
                                        background: "-webkit-linear-gradient(45deg, #C6FFDD, #FBD786, #f7797d)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Mappings Resolved
                                </Typography>
                                <ul>
                                    {semanticData.mapping_info.map((mapping, index) => (
                                        <li key={index}>
                                            <Box display='flex' alignItems='center' gap={1}>
                                                <Typography variant='h6'>Resolved {mapping.diagnosis1} to {mapping.diagnosis2}</Typography>
                                                <CheckCircleIcon sx={{color: 'green'}}/>
                                            </Box>
                                        </li>
                                    ))}
                                </ul>
                            </Box>
                            
                            <Box display='flex' sx={{justifyContent: 'space-around', my: 4}}>
                                <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                    <PieChart width={400} height={400}>
                                        <Pie
                                            dataKey="value"
                                            isAnimationActive={true}
                                            data={genderData}
                                            cx={200}
                                            cy={200}
                                            outerRadius={150}
                                            fill="#8884d8"
                                            label
                                        >
                                            {
                                                genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"} />)
                                            }
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                    <Typography>Gender Ratio Pie Chart</Typography>
                                </Box>

                                <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                    <PieChart width={400} height={400}>
                                        <Pie
                                            data={disabilityData}
                                            cx={200}
                                            cy={200}
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label
                                        >
                                            {
                                            disabilityData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"} />)
                                            }
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                    <Typography>Disability Ratio Pie Chart</Typography>
                                </Box>

                                <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                    <BarChart
                                        width={600}
                                        height={500}
                                        data={bloodGroupData}
                                        layout="horizontal"
                                        margin={{
                                            top: 5, right: 20, left: 20, bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" type="category" angle={-45} textAnchor='end' />
                                        <YAxis type="number" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#8884d8" />
                                    </BarChart>
                                    <Typography>Blood Group Frequency</Typography>
                                </Box>
                            </Box>
                            
                            <Typography>Diagnosis Bar Chart</Typography>
                            <BarChart
                                width={1400}
                                height={600}
                                data={diagnosisData}
                                layout="horizontal"
                                margin={{
                                    top: 5, right: 20, left: 20, bottom: 100,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" type="category" angle={-45} textAnchor='end' />
                                <YAxis type="number" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>

                            <Box display='flex' sx={{justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4, mb: 1 }}>
                                <Paper sx={{height: '30vh', width: '30vw', padding: 2, backgroundImage: 'linear-gradient(45deg, #3a6186, #89253e)'}}>
                                    <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                        <Typography variant='h3'>{ageData.avg_age}</Typography>
                                        <Typography variant='h6'>Average Age</Typography>
                                    </Box>
                                    <Box display='flex' sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
                                        <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                            <Typography variant='h4'>{ageData.min_age}</Typography>
                                            <Typography variant='h6'>Min</Typography>
                                        </Box>
                                        <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                            <Typography variant='h4'>{ageData.max_age}</Typography>
                                            <Typography variant='h6'>Max</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                                <Paper sx={{height: '30vh', width: '30vw', padding: 2, backgroundImage: 'linear-gradient(45deg, #3a6186, #89253e)'}}>
                                    <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                        <Typography variant='h3'>{heartRateData.avg_hr}</Typography>
                                        <Typography variant='h6'>Average Heart Rate</Typography>
                                    </Box>
                                    <Box display='flex' sx={{ justifyContent: 'space-between', px: 3, py: 2}}>
                                        <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                            <Typography variant='h4'>{heartRateData.min_hr}</Typography>
                                            <Typography variant='h6'>Min</Typography>
                                        </Box>
                                        <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                            <Typography variant='h4'>{heartRateData.max_hr}</Typography>
                                            <Typography variant='h6'>Max</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                                <Paper sx={{height: '30vh', width: '30vw', padding: 2, backgroundImage: 'linear-gradient(45deg, #3a6186, #89253e)'}}>
                                    <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                        <Typography variant='h3'>{cholestrolData.avg_chol}</Typography>
                                        <Typography variant='h6'>Average Cholestrol</Typography>
                                    </Box>
                                    <Box display='flex' sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
                                        <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                            <Typography variant='h4'>{cholestrolData.min_chol}</Typography>
                                            <Typography variant='h6'>Min</Typography>
                                        </Box>
                                        <Box display='flex' sx={{flexDirection: 'column', alignItems: 'center'}}>
                                            <Typography variant='h4'>{cholestrolData.max_chol}</Typography>
                                            <Typography variant='h6'>Max</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        </>
                    }
                        
                    {enableDownload && 
                        <Box display='flex' sx={{justifyContent: 'center', gap: 2}}>
                            <Button 
                                sx={{ margin: 2 }}
                                variant='contained'
                                color='secondary'
                                component='a'
                                href='http://localhost:8000/download/'
                                download="rdf_output.rdf"
                            >
                                Download RDF File
                            </Button>
                            <Button 
                                sx={{ margin: 2 }}
                                variant='contained'
                                color='secondary'
                                component='a'
                                href='http://localhost:8000/download_json/'
                                download="combined_json.json"
                            >
                                Download JSON File
                            </Button>
                        </Box>
                    }
                    {outputData &&
                        <>
                            <Typography 
                                variant='h4'
                                align='center'
                                sx={{
                                    mt: 4,
                                    background: "-webkit-linear-gradient(45deg, #C6FFDD, #FBD786, #f7797d)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                               Triples in RDF File 
                            </Typography>
                            <Box 
                                sx={{
                                    overflowY: 'auto',
                                    maxHeight: '60vh',
                                    border: '2px solid white',
                                    borderRadius: '20px 0px 0px 20px',
                                    px: 2,
                                    my: 3
                                }}
                            >
                                <Typography 
                                    component='pre'
                                    sx={{
                                        py: 1
                                    }}
                                >
                                    {outputData}
                                </Typography>
                            </Box>
                        </>
                    }

                    <Box        
                        component='footer'
                        sx={{
                            width: '100%',
                            mt: 'auto',
                            mb: 1,
                        }}
                    >
                        <Typography align='center'>By Royce Dmello(9533), Vedant Pathare(9564) & Jatin Kadu(9548)</Typography>
                        <Typography align='center'>Under the guidance of Dr. Vijay Shelke</Typography>
                    </Box>
                </Container>
            </ThemeProvider>
        </>
    );
}

export default App;
