import { Component } from 'react'

import MQTT from 'async-mqtt'

import './App.css'
import { Helmet } from 'react-helmet'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      mqttClient: { connected: false, end: () => {} },
      connectionStatus: false,
      title: 'MQTT Status Page',
      backgroundColor: 'grey',
      foregroundColor: 'black',
      mode: 'loading',
      presets: {
        default: {
          message: 'Loading',
          backgroundColor: 'black',
          foregroundColor: 'white'
        }
      }
    }
  }

  async componentDidMount () {
    const appConfig = await fetch('/config.json').then(res => res.json())

    const mqttClient = MQTT.connect(appConfig.mqttUri)

    mqttClient.on('connect', () => {
      console.log('MQTT connected')
      this.setState({ connectionStatus: true })
      mqttClient.subscribe(appConfig.mqttTopic ?? '/test/vhs/spacebus/status/space/mask')
    })

    mqttClient.on('message', (topic, payload, packet) => {
      if (appConfig.mqttTopic === topic) {
        this.setState({ mode: payload.toString() })
      }
    })

    this.setState({ mqttClient, ...appConfig })
  }

  componentWillUnmount () {
    if (this.state.mqttClient != null && this.state.mqttClient.connected != null && this.state.mqttClient.end != null) {
      return this.state.mqttClient.end()
    }
  }

  render () {
    const mode = this.state.connectionStatus === true ? this.state.mode : 'loading'

    const preset = this.state.presets[mode] !== undefined ? this.state.presets[mode] : this.state.presets.loading !== undefined ? this.state.presets.loading : this.state.presets.default !== undefined ? this.state.presets.default : { message: 'ERROR', backgroundColor: 'yellow', foregroundColor: 'red' }

    const backgroundColor = preset.backgroundColor ?? this.state.backgroundColor ?? 'grey'
    const foregroundColor = preset.foregroundColor ?? this.state.foregroundColor ?? 'red'
    const message = preset.message ?? 'ERROR'

    const maxWordHeight = message.split(' ').length
    const maxWordLength = Math.max(...(message.split(' ').map(el => el.length)))
    const fontSize = ((18 - maxWordLength) * (1 - (maxWordHeight * 0.1))) + 'vw'

    return (
      <>
      <Helmet>
        <title>{this.state.title}</title>
      </Helmet>
        <div className="App" style={{ backgroundColor, color: foregroundColor }}>
          <div className="App-header" style={{ fontSize }}>
            <h1>{message.toUpperCase()}</h1>
          </div>
        </div>
      </>
    )
  }
}

export default App
