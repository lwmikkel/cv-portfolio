import { useState } from 'react'
import './Demo.css'

const accounts = [
  { email: 'student@aau.dk', role: 'participant', label: 'Participant' },
  { email: 'organizer@aau.dk', role: 'organizer', label: 'Organizer' },
]

const startEvents = [
  { id: 1, title: 'React workshop', when: 'Thu 14:00', place: 'Building A', capacity: 20, going: 12, attendees: [] },
  { id: 2, title: 'Study group: algorithms', when: 'Fri 10:00', place: 'Room 2.14', capacity: 8, going: 6, attendees: [] },
  { id: 3, title: 'Friday bar', when: 'Fri 16:00', place: 'Student bar', capacity: 30, going: 30, attendees: [] },
  { id: 4, title: 'Hackathon prep', when: 'Sat 11:00', place: 'Lab 3', capacity: 12, going: 4, attendees: [] },
]

const newTitles = ['Board game night', 'Career talk', 'Pitch practice', 'Coding dojo']

function EventDemo() {
  const [events, setEvents] = useState(startEvents)
  const [account, setAccount] = useState(null)
  const [created, setCreated] = useState(0)

  const organizer = account?.role === 'organizer'

  function toggleSignUp(event) {
    const joined = event.attendees.includes(account.email)
    setEvents(list => list.map(item => (
      item.id === event.id
        ? { ...item, attendees: joined ? item.attendees.filter(a => a !== account.email) : [...item.attendees, account.email] }
        : item
    )))
  }

  function removeEvent(id) {
    setEvents(list => list.filter(event => event.id !== id))
  }

  function newEvent() {
    const title = newTitles[created % newTitles.length]
    setEvents(list => [...list, { id: Date.now(), title, when: 'Next week', place: 'Campus', capacity: 20, going: 0, attendees: [] }])
    setCreated(value => value + 1)
  }

  if (!account) {
    return (
      <div className="demo">
        <div className="demo-bar">
          <span className="label">Event platform</span>
          <span className="demo-tag">Not logged in</span>
        </div>

        <div className="login">
          <p className="login-title">Log in as</p>
          <div className="login-choices">
            {accounts.map(item => (
              <button key={item.role} type="button" className="btn-pill" onClick={() => setAccount(item)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="demo">
      <div className="demo-bar">
        <span className="demo-group">
          <b className="who">{account.email}</b>
          <span className="role-chip">{account.role}</span>
        </span>
        <button type="button" className="btn-pill ghost small" onClick={() => setAccount(null)}>Log out</button>
      </div>

      {organizer && (
        <div className="event-tools">
          <button type="button" className="btn-pill ghost small" onClick={newEvent}>New event</button>
        </div>
      )}

      <ul className="event-list">
        {events.map(event => {
          const going = event.going + event.attendees.length
          const joined = event.attendees.includes(account.email)
          const full = going >= event.capacity
          return (
            <li className="event-row" key={event.id}>
              <div className="event-info">
                <span className="event-title">{event.title}</span>
                <span className="event-meta">{event.when} · {event.place}</span>
              </div>
              <div className="event-seats">
                <span className="meter"><i style={{ width: `${Math.min(100, (going / event.capacity) * 100)}%` }} /></span>
                <span>{going} / {event.capacity}</span>
              </div>
              {organizer ? (
                <button type="button" className="btn-pill ghost small" onClick={() => removeEvent(event.id)}>Remove</button>
              ) : (
                <button type="button" className={`btn-pill small${joined ? ' ghost' : ''}`} disabled={full && !joined} onClick={() => toggleSignUp(event)}>
                  {joined ? 'Cancel' : full ? 'Full' : 'Sign up'}
                </button>
              )}
            </li>
          )
        })}
        {events.length === 0 && <li className="event-empty">No events.</li>}
      </ul>

    </div>
  )
}

export default EventDemo
