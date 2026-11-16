import { useState } from 'react'
import './Demo.css'
import movie from '../../assets/events/movie.webp'
import step from '../../assets/events/step.webp'
import kayak from '../../assets/events/kayak.webp'
import amped from '../../assets/events/amped.webp'

const accounts = [
  { email: 'student@aau.dk', role: 'participant', label: 'Participant' },
  { email: 'organizer@aau.dk', role: 'organizer', label: 'Organizer' },
]

const startEvents = [
  { id: 1, title: 'Software movie night', when: 'Thu 19:00', place: 'Building A', image: movie, capacity: 40, going: 27, attendees: [] },
  { id: 2, title: 'Study start event', when: 'Fri 16:00', place: 'Student bar', image: step, capacity: 60, going: 41, attendees: [] },
  { id: 3, title: 'Kayak trip', when: 'Sat 11:00', place: 'Copenhagen harbour', image: kayak, capacity: 12, going: 12, attendees: [] },
  { id: 4, title: 'Amped night', when: 'Sat 21:00', place: 'Campus', image: amped, capacity: 80, going: 35, attendees: [] },
]

const startGroups = [
  { id: 1, name: 'Algorithms study group', topic: 'Weekly problem solving', members: 14 },
  { id: 2, name: 'Board game club', topic: 'Fridays in the student bar', members: 22 },
  { id: 3, name: 'Kayak club', topic: 'Harbour trips in the summer', members: 31 },
]

const newEvents = [
  { title: 'Board game night', image: movie },
  { title: 'Career talk', image: step },
  { title: 'Harbour walk', image: kayak },
  { title: 'Pitch practice', image: amped },
]

function EventDemo() {
  const [events, setEvents] = useState(startEvents)
  const [account, setAccount] = useState(null)
  const [created, setCreated] = useState(0)
  const [view, setView] = useState('events')
  const [groups, setGroups] = useState(startGroups.map(group => ({ ...group, joined: false })))

  const organizer = account?.role === 'organizer'

  function toggleSignUp(event) {
    const joined = event.attendees.includes(account.email)
    setEvents(list => list.map(item => (
      item.id === event.id
        ? { ...item, attendees: joined ? item.attendees.filter(a => a !== account.email) : [...item.attendees, account.email] }
        : item
    )))
  }

  function toggleGroup(id) {
    setGroups(list => list.map(group => (
      group.id === id ? { ...group, joined: !group.joined, members: group.members + (group.joined ? -1 : 1) } : group
    )))
  }

  function removeEvent(id) {
    setEvents(list => list.filter(event => event.id !== id))
  }

  function newEvent() {
    const next = newEvents[created % newEvents.length]
    setEvents(list => [...list, { id: Date.now(), mine: true, title: next.title, when: 'Next week', place: 'Campus', image: next.image, capacity: 30, going: 0, attendees: [] }])
    setCreated(value => value + 1)
  }

  const current = !account && view === 'mine' ? 'events' : view

  const header = (
    <div className="ev-top">
      <span className="ev-brand">AAU CPH <b>Events</b></span>
      <nav className="ev-nav" aria-label="Demo menu">
        <button type="button" className={current === 'events' ? 'on' : ''} onClick={() => setView('events')}>Events</button>
        {account && <button type="button" className={current === 'mine' ? 'on' : ''} onClick={() => setView('mine')}>My events</button>}
        <button type="button" className={current === 'groups' ? 'on' : ''} onClick={() => setView('groups')}>Groups</button>
      </nav>
      {account ? (
        <button type="button" className="ev-login" onClick={() => { setAccount(null); setView('events') }}>Log out</button>
      ) : (
        <span className="ev-login ev-login-idle">Log in</span>
      )}
    </div>
  )

  if (!account && current !== 'groups') {
    return (
      <div className="demo ev">
        {header}
        <div className="ev-body ev-center">
          <p className="ev-login-title">Log in as</p>
          <div className="login-choices">
            {accounts.map(item => (
              <button key={item.role} type="button" className="ev-btn" onClick={() => setAccount(item)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const joinedEvents = events.filter(event => (organizer ? event.mine : event.attendees.includes(account?.email)))

  function card(event) {
    const going = event.going + event.attendees.length
    const joined = account && event.attendees.includes(account.email)
    const full = going >= event.capacity
    return (
      <li className="ev-card" key={event.id}>
        <img src={event.image} alt="" width="480" height="360" />
        <p className="ev-title">{event.title}</p>
        <p className="ev-meta">{event.when} · {event.place}</p>
        <div className="ev-seats">
          <span className="ev-meter"><i style={{ width: `${Math.min(100, (going / event.capacity) * 100)}%` }} /></span>
          <span>{going} / {event.capacity}</span>
        </div>
        {organizer ? (
          <button type="button" className="ev-btn ev-btn-ghost" onClick={() => removeEvent(event.id)}>Remove</button>
        ) : (
          <button type="button" className={`ev-btn${joined ? ' ev-btn-ghost' : ''}`} disabled={full && !joined} onClick={() => toggleSignUp(event)}>
            {joined ? 'Cancel' : full ? 'Full' : 'Sign up'}
          </button>
        )}
      </li>
    )
  }

  return (
    <div className="demo ev">
      {header}
      <div className="ev-body">
        {current === 'groups' ? (
          <>
            <div className="ev-bar"><span className="ev-who">Study groups and clubs</span></div>
            <ul className="ev-groups">
              {groups.map(group => (
                <li className="ev-group" key={group.id}>
                  <div>
                    <p className="ev-title">{group.name}</p>
                    <p className="ev-meta">{group.topic} · {group.members} members</p>
                  </div>
                  {account ? (
                    <button type="button" className={`ev-btn${group.joined ? ' ev-btn-ghost' : ''}`} onClick={() => toggleGroup(group.id)}>
                      {group.joined ? 'Leave' : 'Join'}
                    </button>
                  ) : (
                    <span className="ev-meta">Log in to join</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="ev-bar">
              <span className="ev-who">{account.email} · {account.role}</span>
              {organizer && current === 'events' && <button type="button" className="ev-btn ev-btn-light" onClick={newEvent}>New event</button>}
            </div>
            {current === 'mine' ? (
              <ul className="ev-grid">
                {joinedEvents.map(card)}
                {joinedEvents.length === 0 && (
                  <li className="ev-empty">{organizer ? 'You have not created any events yet. Use New event on the Events page.' : 'You have not signed up for any events yet.'}</li>
                )}
              </ul>
            ) : (
              <ul className="ev-grid">
                {events.map(card)}
                {events.length === 0 && <li className="ev-empty">No events.</li>}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EventDemo
