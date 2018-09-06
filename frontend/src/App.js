import React, {Component} from 'react'
import _sum from 'lodash/sum'
import _isEqual from 'lodash/isEqual'
import './App.css'
import moment from 'moment'
require('moment-duration-format')(moment)

function buildStateComponent(propsToValue) {
  return class extends Component {
    constructor(props) {
      super(props)
      const value = propsToValue(props)
      this.state = {value}
      this.lastValueGeneratedFromProps = value
    }

    componentWillReceiveProps(props) {
      const value = propsToValue(props)
      if (!_isEqual(value, this.lastValueGeneratedFromProps)) {
        this.setState({value})
        this.lastValueGeneratedFromProps = value
      }
    }

    render() {
      const {children} = this.props
      const {value} = this.state
      return children(value, this._handleChange)
    }

    _handleChange = value => {
      this.setState({value})
    }
  }
}

const fullDateRange = date => {
  const start = moment(date)
    .startOf('day')
    .toDate()
    .getTime()
  return [start, start + 24 * 60 * 60 * 1000]
}
const RangeSelector = buildStateComponent(({date}) => fullDateRange(date))

const DAYPATH_DATA =
  'M14.354 31.796C7.312 30.57 1.957 24.406 1.957 16.99c0-8.3 6.706-15.028 14.976-15.028m0 0c8.271 0 14.976 6.729 14.976 15.028 0 7.418-5.355 13.58-12.396 14.806m0 0c-1.196.195-1.428.245-2.567.959-1.14.713-1.753.683-2.594.576m0 0C6.496 32.335.487 25.273.487 17.04.487 7.925 7.85.487 16.933.487c9.083 0 16.446 7.389 16.446 16.503 0 8.234-6.008 15.059-13.865 16.3m0 0c-1.133.135-1.596-.183-2.569-.536-.97-.352-1.354-.776-2.59-.958'

const colors = {
  green: '#4bab3f',
  red: '#ff4217',
  yellow: '#ffed13',
  break: 'blue',
  off: 'transparent',
  party: 'pink',
  meeting: 'teal',
}

function DayView2({from, data: {entries}}) {
  const dayLength = 24 * 60 * 60 * 1000
  const factor = 500
  return (
    <div className="daypath">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="128"
        height="128"
        viewBox="0 0 33.866702 33.866734">
        <path className="empty" d={DAYPATH_DATA} />
        {entries
          .filter(({status}) => status !== 'off')
          .map(({status, start, duration}) => (
            <path
              key={start}
              stroke={colors[status]}
              d={DAYPATH_DATA}
              onMouseOver={() => console.log(moment.duration(duration).humanize())}
              strokeDashoffset={`${(start - from) / dayLength * factor}`}
              strokeDasharray={`${duration / dayLength * factor} 500000000000`}
            />
          ))}
      </svg>
    </div>
  )
}

class DayView extends Component {
  render() {
    const {from, data: {entries}} = this.props
    const dayLength = 24 * 60 * 60 * 1000
    return (
      <div className="App">
        <h2>{moment(from).format('Y, MMM D')}</h2>
        <div className="day">
          {entries.map(({status, start, duration}) => (
            <div
              key={start}
              style={{
                width: 100 * duration / dayLength + '%',
                left: 100 * (start - from) / dayLength + '%',
              }}
              className={`dayEntry status-${status}`}
            />
          ))}
        </div>
        <div className="dayLabels">
          {entries.map(({status, start, duration}) => (
            <div
              key={start}
              style={{
                flexGrow: duration,
              }}
              className={`dayLabel status-${status}`}>
              {moment.duration(duration).format('h[h]mm[m]')}
            </div>
          ))}
        </div>
      </div>
    )
  }
}

async function api(url, options) {
  const response = await fetch(`http://localhost:5000${url}`, options)
  if (!response.ok) {
    throw new Error(await response.text())
  }
  const json = await response.json()
  return json
}

class DataController extends Component {
  state = {}

  async componentDidMount() {
    const {from, to} = this.props
    const data = await api(`/stats?from=${from}&to=${to}`)
    this.setState({data})
  }

  render() {
    const {from, to, date} = this.props
    const {data} = this.state
    return data ? <DayView2 {...{from, to, date, data}} /> : null
  }
}

const DataWrapper = props => (
  <RangeSelector date={props.date}>
    {(range, onChangeRange) => <DataController from={range[0]} to={range[1]} {...props} />}
  </RangeSelector>
)

export default () => <DataWrapper date="2018-05-07" />
