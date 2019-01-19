import React, {Component} from 'react'
import './App.css'
import moment from 'moment'
require('moment-duration-format')(moment)

const DAY_LENGTH = 24 * 60 * 60 * 1000

class Week extends Component {
  render() {
    const {data, from, onChange} = this.props
    return (
      <div className="week">
        <h1>Week {from.format('w [of] GGGG')}</h1>
        <div onClick={() => onChange(moment())}>Today</div>

        <div className="prev-button" onClick={() => onChange(from.clone().add(-1, 'week'))}>
          &lt;
        </div>
        <div className="next-button" onClick={() => onChange(from.clone().add(1, 'week'))}>
          &gt;
        </div>

        <div className="weekdays">
          {[0, 1, 2, 3, 4, 5, 6].map(weekday => {
            const fromDay = from.clone().add(weekday, 'days')
            return (
              <div key={weekday} className="weekday">
                <header>
                  <h2>{fromDay.format('dddd')}</h2>
                  <h3>{fromDay.format('MMM D')}</h3>
                </header>
                <DayView day={fromDay} {...{data}} onMouse={console.log} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

class DayView extends Component {
  render() {
    const {day, data: {entries}} = this.props

    const dayStart = day.toDate().getTime()
    const dayEnd = dayStart + DAY_LENGTH

    return (
      <div
        className="day"
        onMouseDown={this._handleMouse('down')}
        onMouseUp={this._handleMouse('up')}
        onClick={this._handleMouse('click')}>
        {entries
          .filter(({start, duration}) => start + duration >= dayStart && start <= dayEnd)
          .map(({status, start, duration}) => (
            <div
              key={start}
              style={{
                height: 100 * duration / DAY_LENGTH + '%',
                top: 100 * (start - dayStart) / DAY_LENGTH + '%',
              }}
              className={`dayEntry status-${status}`}
            />
          ))}
      </div>
    )
  }

  _handleMouse = dir => e => {
    const {day, onMouse} = this.props
    if (onMouse) {
      const rect = e.target.closest('.day').getBoundingClientRect()
      const y = (e.clientY - rect.top) / rect.height
      const yMillis = Math.round(y * DAY_LENGTH)
      const clickDate = new Date(day.toDate().getTime() + yMillis)
      onMouse(dir, moment(clickDate))
    }
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
  state = {data: null}

  componentDidMount() {
    this._fetch(this.props)
  }

  componentWillReceiveProps(props) {
    if (!this.props.from.isSame(props.from) || !this.props.to.isSame(props.to)) {
      this._fetch(props)
    }
  }

  async _fetch({from, to}) {
    const data = await api(`/stats?from=${from.toDate().getTime()}&to=${to.toDate().getTime()}`)
    this.setState({data})
  }

  render() {
    const {data} = this.state
    const {unit} = this.props
    if (!data) return null
    if (unit === 'week') {
      return <Week {...{data, ...this.props}} />
    } else {
      return <div>Unknown unit {unit}</div>
    }
  }
}

class RangeSelector extends Component {
  state = {
    date: moment().startOf('week'),
    unit: 'week',
  }

  render() {
    const {date, unit} = this.state
    const from = date.clone().startOf(unit)
    const to = from.clone().add(1, unit)
    console.log('fetching week', from.format('w GGGG'), from.format('lll'))
    return this.props.children({unit, from, to, onChange: this._handleChange.bind(this)})
  }

  _handleChange(newDate) {
    this.setState({
      date: newDate.clone().startOf(this.state.unit),
    })
  }
}

const DataWrapper = props => (
  <RangeSelector date={props.date}>
    {({unit, from, to, onChange}) => <DataController {...{unit, from, to, onChange, ...props}} />}
  </RangeSelector>
)

export default () => (
  <div className="App">
    <main>
      <DataWrapper date={moment()} />
    </main>
  </div>
)
