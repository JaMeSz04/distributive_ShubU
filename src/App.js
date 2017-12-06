import React from 'react'
import Web3  from 'web3'
import {Navbar, Thumbnail, Button, Row, Col, Grid} from 'react-bootstrap'
import axios from 'axios'


const thumbnailStyle = {
    textAlign : "center"
}

export default class App extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            selected : 1,
            storages : []
        }
        this.getContent = this.getContent.bind(this)
    }

    getContent( title, provider, repo ){
        axios.get("http://api.github.com/repos/JaMeSz04/cvAssignment/readme").then( res => {
            console.log(res.data)
            atob(res.data.content)
        })
    }

    componentDidMount(){
        const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

        //get data from every single block
        const dumpArray = Array.from( new Array(web3.eth.blockNumber + 1).keys() )
        let blockData = dumpArray.map( element => web3.eth.getBlock(element) )
        blockData = blockData.filter( element => element.transactions.length > 0 )
        blockData = blockData.map( element => element.transactions )
        
        console.log(blockData)
        //convert all block into single transaction chains
        let chains = []
        blockData.forEach( block => block.forEach(trans => chains.push(trans)) )
        
        //get transaction data out
        chains = chains.map( transaction => JSON.parse(web3.toAscii(web3.eth.getTransaction(transaction).input)) )
        
    }

    render(){
        const Cards = this.state.storages.map( (element,index) => (
            index % 3 === 0?
            <Row>
                <Col md = {4} sm = {4}>
                    <Thumbnail>
                        <h4 style = {thumbnailStyle}> {element.title} </h4>
                        <hr/>
                        <p style = {thumbnailStyle}>{element.content}</p>
                        <Button bsStyle = "warning" block> OK </Button>
                    </Thumbnail>
                </Col>
            </Row>
            :
            <Col md = {4} sm = {4}>
                <Thumbnail>
                    <h4 style = {thumbnailStyle}>{element.title}</h4>
                    <hr/>
                    <p style = {thumbnailStyle}>{element.content}</p>
                    <Button bsStyle = "warning" block> OK </Button>
                </Thumbnail>
            </Col>

        ))

        return (
        <div>
            <Navbar>
                <Navbar.Header>
                <Navbar.Brand>
                    <a>ShubU Storage System</a>
                </Navbar.Brand>
                </Navbar.Header>
                
            </Navbar>
            <Grid>
                {Cards}
            </Grid>
        </div>
        )
    }

}