import React from 'react'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
 

export class Demo extends React.Component {
  render() {
    const data = [{
      name: 'Tanner Linsley',
      age: 26,
      friend: {
        name: 'Jason Maurer',
        age: 23,
      }
    },{
      name: 'Arbor Warmber',
      age: 22,
      friend: {
        name: 'Jason Maurer',
        age: 23,
      }
    },{
      name: 'Commisioner Cordwood',
      age: 26,
      friend: {
        name: 'Bobby Berman',
        age: 32,
      }
    },]

    const columns = [{
      Header: 'Name',
      accessor: 'name' // String-based value accessors!
    }, {
      Header: 'Age',
      accessor: 'age',
      Cell: props => <span className='number'>{props.value}</span> // Custom cell components!
    }, {
      id: 'friendName', // Required because our accessor is not a string
      Header: 'Friend Name',
      accessor: d => d.friend.name // Custom value accessors!
    }, {
      Header: props => <span>Friend Age</span>, // Custom header components!
      accessor: 'friend.age'
    }]

    return <ReactTable data={data} columns={columns} />
  }
}


