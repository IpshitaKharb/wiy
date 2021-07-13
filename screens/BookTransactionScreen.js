import React from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as firebase from 'firebase'
import db from '../config'

export default class TransactionScreen extends React.Component {
  constructor() {
    super()
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedStudentId: '',
      buttonState: 'normal',
      transactionMeassage: '',
      scannedData: '',
    }
  }

  //important
  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermissions: status === 'granted',
      buttonState: id,
      scanned: false,
    })
  }

  handleBarCodeScanned = async ({ type, data }) => {
    const { buttonState } = this.state
    if (buttonState === 'bookId') {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: 'normal',
      })
    } else if (buttonState === 'studentId') {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: 'normal',
      })
    }
  }
  initiateBookIssue = async () => {
    //add a transaction
    db.collection('transaction').add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      data: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Issue',
    })

    //change book status
    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability: false,
    })
    //change number of issued books for student
    db.collection('students')
      .doc(this.state.scannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      })

    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    })
  }

  initiateBookReturn = async () => {
    //add a transaction
    db.collection('transactions').add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'Return',
    })

    //change book status
    db.collection('books').doc(this.state.scannedBookId).update({
      bookAvailability: true,
    })

    //change book status
    db.collection('students')
      .doc(this.state.scannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      })

    this.setState({
      scannedStudentId: '',
      scannedBookId: '',
    })
  }

  handleTransaction = async () => {
    var transactionMessage = null
    db.collection('books')
      .doc(this.state.scannedBookId)
      .get()
      .then((doc) => {
        var book = doc.data()
        if (book.bookAvailability) {
          this.initiateBookIssue()
          transactionMessage = 'Book Issued'
        } else {
          this.initiateBookReturn()
          transactionMessage = 'Book Returned'
        }
      })

    this.setState({
      transactionMessage: transactionMessage,
    })
  }

  render() {
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const buttonState = this.state.buttonState
    if (buttonState === 'clicked' && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        ></BarCodeScanner>
      )
    } else if (buttonState === 'normal') {
      return (
        <View style={styles.container}>
          <View>
            <Image
              source={require('../assets/booklogo.jpg')}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ textAlign: 'center', fontSize: 30 }}>Wily App</Text>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="bookId"
              value={this.state.scannedBookId}
            ></TextInput>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('bookId')
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="StudentId"
              value={this.state.scannedStudentId}
            ></TextInput>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions('StudentId')
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.displayText}>
            {hasCameraPermissions === true
              ? this.state.scannedData
              : 'request camera permission'}
          </Text>
          <TouchableOpacity
            onPress={this.getCameraPermissions}
            style={styles.scanButton}
          >
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10,
  },
  buttonText: {
    fontSize: 20,
  },
  inputView: {
    flexDirection: 'row',
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
  },
})
