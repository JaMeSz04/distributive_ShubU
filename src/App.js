import React, {Component} from 'react'
import Web3  from 'web3'
import {Navbar, Thumbnail, Button, Row, Col, Grid, Modal, FormGroup, ControlLabel, FormControl} from 'react-bootstrap'
import axios from 'axios'


const DUMMY_ACCOUNT = "0x3d1c396cf5da0385d44366467051440f4b3b2e6f"

const thumbnailStyle = {
    textAlign : "center"
}

const FieldGroup = ({ id, label, help, ...props, onChange }) => {
    return (
      <FormGroup controlId={id}>
        <ControlLabel>{label}</ControlLabel>
        <FormControl onChange = {(e) => onChange(e)} {...props} />
      </FormGroup>
    )
  }

const AddTransModalB = ({show, add, onHide, onTitleChange, onUrlChange}) => (
    <Modal show = {show} bsSize="small" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg"> Add new projects </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form>
            <FieldGroup
                id="formControlsText"
                type="text"
                label="Title"
                placeholder="Enter Title"
                onChange = {(e) => onTitleChange(e.target.value)}
            />
            <FieldGroup
                id="formControlsText"
                type="text"
                label="Url link"
                placeholder="Enter github url"
                onChange = {(e) => onUrlChange(e.target.value)}
            />
        </form>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={() => onHide()}>Close</Button>
            <Button onClick={() => add()} bsStyle = "success"> Add </Button>
        </Modal.Footer>
    </Modal>
)

//obj structure 

export default class App extends Component {

    constructor(props){
        super(props)
        this.state = {
            selected : 1,
            storages : [],
            web3 : new Web3(new Web3.providers.HttpProvider('http://localhost:8545')),
            modal : false,
            title : "",
            url : "",
            loading : false
        }
     
        this.createTransaction = this.createTransaction.bind(this)
        this.refresh = this.refresh.bind(this)
        this.validate = this.validate.bind(this)
    }

    createTransaction(title, link){
        this.setState({loading: true, modal : false})
        console.log(this.state.web3.eth.accounts)
        const acc1 = this.state.web3.eth.accounts[0]
        const amount = this.state.web3.toWei(0.00000001, "ether")
        this.state.web3.personal.unlockAccount(acc1, 'Beareater05',10)
        const seperatedLink = link.replace(/(^\w+:|^)\/\//, '').split('/')
        // ["github.com", "JaMeSz04", "distributive_ShubU"]
        axios.get("http://api.github.com/repos/" + seperatedLink[1] + "/" + seperatedLink[2] + "/readme").then( res => {
            console.log(res.data)
            const readme = atob(res.data.content) //convert base64 back to string
            const transac = {
                title,
                Description : "this is the test",
                link : link
            }
            const transacObj = {
                from : acc1, 
                to : DUMMY_ACCOUNT, 
                value : amount, 
                data : this.state.web3.toHex(JSON.stringify(transac))
            }
            const txId = this.state.web3.eth.sendTransaction(transacObj)
            console.log(this.state.web3.eth.getTransaction(txId))
            console.log( "txID : " + txId )
            this.validate()
            this.setState({loading : false})
            this.refresh()
        })
        
    }

    validate(){
        
            if (this.state.web3.eth.mining) return;
            console.log("== Pending transactions! Mining...")
            this.state.web3.eth.start(1);
  
            this.state.web3.eth.stop()
            console.log("mine")

        
      
    }

    refresh(){
        console.log(this.state.web3.eth)
        console.log(this.state.web3)
        //get data from every single block
        const dumpArray = Array.from( new Array(this.state.web3.eth.blockNumber + 1).keys() )
        let blockData = dumpArray.map( element => this.state.web3.eth.getBlock(element) )
        console.log(blockData)
        blockData = blockData.filter( element => element.transactions.length > 0 )
        blockData = blockData.map( element => element.transactions )
        //convert all block into single transaction chains
        let chains = []
        blockData.forEach( block => block.forEach(trans => chains.push(trans)) )
        //get transaction data out
        chains = chains.map( transaction => JSON.parse(this.state.web3.toAscii(this.state.web3.eth.getTransaction(transaction).input)) )
        console.log(chains)
        this.setState({storages : chains})
    }

    componentDidMount(){
        this.refresh()
    }

    render(){
        const Cards = this.state.storages.map( (element,index) => (
            <Col md = {4} sm = {4}>
                <Thumbnail>
                    <h4 style = {thumbnailStyle}>{element.title}</h4>
                    <hr/>
                    <p style = {thumbnailStyle}>{element.content}</p>
                    <a href = {element.link} className = "btn btn-block btn-warning"> OK </a>
                </Thumbnail>
            </Col>
        ))

        return (
        <div>
            <AddTransModalB 
                onTitleChange = {val => this.setState({title: val})}
                onUrlChange = {val => this.setState({url: val})}
                show = {this.state.modal} 
                add = { event => this.createTransaction(this.state.title, this.state.url)} 
                onHide = {() => this.setState({modal : false})} />
            <Navbar>
                <Navbar.Header>
                <Navbar.Brand>
                    <a>ShubU Storage System</a>
                </Navbar.Brand>
                </Navbar.Header>
            </Navbar>
            <Grid>
                <Row>
                    {Cards}
                </Row>
                <Row>
                    <Col md = {10} sm = {10}> </Col>
                    <Col md = {2} sm = {2}> 
                        <Button bsStyle = "primary" onClick = {() => this.setState({modal : true})}> Create new </Button> 
                    </Col>
                </Row>
            </Grid>
        </div>
        )
    }

}