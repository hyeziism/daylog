
import { useState } from 'react'
type JournalEntry = {
  id: string
  text: string
  createdAt: string
}


type HealthEntry = {
  id: string
  date: string

  // 체중 및 체성분
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null

  // 혈압 및 심박수
  systolic: number | null
  diastolic: number | null
  heartRate: number | null

  // 수면
  sleepStart: string
  sleepEnd: string
  sleepHours: number | null

  // 수분 섭취
  water: number

  // 식사
  meals: MealEntry[]

  // 건강 메모
  memo: string

  // 복약
  medications: Medication[]
}

type MealEntry = {
  id: string
  type: '아침' | '점심' | '저녁' | '간식'
  name: string
  calories: number | null
  time: string
}

type Medication = {
  id: string
  name: string
  dose: string
  times: string[]
  active: boolean
  takenTimes: string[]
  createdAt: string
}

type MenstrualEntry = {
  id: string
  startDate: string
  endDate: string
}

import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('main')
  const [showYearMonths, setShowYearMonths] = useState(false)
  const today = new Date().toLocaleDateString('sv-SE')
    const [healthEntries, setHealthEntries] = useState<HealthEntry[]>(() => {
  const saved = localStorage.getItem('daylog-health-entries')

  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }

  return []
})

// 생리 기록
const [periodEntries, setPeriodEntries] = useState<MenstrualEntry[]>(() => {
  const saved = localStorage.getItem('daylog-period-entries')

  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }

  return []
})

const [periodStartDate, setPeriodStartDate] = useState(
  new Date().toLocaleDateString('sv-SE')
)

const [periodEndDate, setPeriodEndDate] = useState('')

  // 건강 기록 조회용 상태
const [selectedHealthDate, setSelectedHealthDate] = useState(
  new Date().toLocaleDateString('sv-SE')
)

// 캘린더에서 현재 보고 있는 월
const [healthCalendarDate, setHealthCalendarDate] = useState(
  new Date()
)

// 선택한 날짜의 건강 기록
const selectedHealthEntry = healthEntries.find(
  (entry) => entry.date === selectedHealthDate
)

  const saveHealthEntries = (entries: HealthEntry[]) => {
    setHealthEntries(entries)

    localStorage.setItem(
      'daylog-health-entries',
      JSON.stringify(entries)
    )
  }
  // 복약 목록 불러오기
const [medicationList, setMedicationList] = useState<Medication[]>(() => {
  const saved = localStorage.getItem('daylog-medications')

  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }

  return []
})

// 복약 목록 저장
const saveMedicationList = (medications: Medication[]) => {
  setMedicationList(medications)

  localStorage.setItem(
    'daylog-medications',
    JSON.stringify(medications)
  )
}
// 새 약 등록용 입력 상태
const [newMedicationName, setNewMedicationName] = useState('')
const [newMedicationDose, setNewMedicationDose] = useState('')
const [newMedicationTime, setNewMedicationTime] = useState('')
const [newMedicationTimes, setNewMedicationTimes] = useState<string[]>([])
// 수정 중인 약의 ID
const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null)

// 복용 시간 추가
const handleAddMedicationTime = () => {
  if (!newMedicationTime) {
    alert('복용 시간을 선택해 줘!')
    return
  }

  if (newMedicationTimes.includes(newMedicationTime)) {
    alert('이미 등록된 시간이야!')
    return
  }

  setNewMedicationTimes([...newMedicationTimes, newMedicationTime].sort())
  setNewMedicationTime('')
}

// 약 등록 및 수정
const handleAddMedication = () => {
  if (!newMedicationName.trim()) {
    alert('약 이름을 입력해 줘!')
    return
  }

  if (newMedicationTimes.length === 0) {
    alert('복용 시간을 하나 이상 추가해 줘!')
    return
  }

  if (editingMedicationId) {
    const updated = medicationList.map((med) =>
      med.id === editingMedicationId
        ? {
            ...med,
            name: newMedicationName.trim(),
            dose: newMedicationDose,
            times: newMedicationTimes,
          }
        : med
    )

    saveMedicationList(updated)
    alert('약 정보가 수정되었어!')
  } else {
    const newMedication: Medication = {
      id: crypto.randomUUID(),
      name: newMedicationName.trim(),
      dose: newMedicationDose,
      times: newMedicationTimes,
      active: true,
      takenTimes: [],
      createdAt: today,
    }

    saveMedicationList([...medicationList, newMedication])
    alert('약이 등록되었어!')
  }

  setNewMedicationName('')
  setNewMedicationDose('')
  setNewMedicationTimes([])
  setNewMedicationTime('')
  setEditingMedicationId(null)
}
// 약 수정 시작
const handleEditMedication = (med: Medication) => {
  setEditingMedicationId(med.id)
  setNewMedicationName(med.name)
  setNewMedicationDose(med.dose)
  setNewMedicationTimes([...med.times])
  setNewMedicationTime('')
}

 const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
  const saved = localStorage.getItem('daylog-journal-entries')

  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }

  // 기존에 작성했던 일기가 있다면 새 구조로 이전
  const oldJournal = localStorage.getItem(`daylog-journal-${today}`)

  if (oldJournal) {
    return [{
      id: crypto.randomUUID(),
      text: oldJournal,
      createdAt: new Date().toISOString(),
    }]
  }

  return []
})

const [journalDraft, setJournalDraft] = useState('')
const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
const [journalPeriod, setJournalPeriod] = useState('일별')
const [selectedJournalDate, setSelectedJournalDate] = useState(
  new Date().toLocaleDateString('sv-SE')
)
const [selectedJournalWeek, setSelectedJournalWeek] = useState(
  new Date().toLocaleDateString('sv-SE')
)
const [selectedJournalMonth, setSelectedJournalMonth] = useState(
  new Date().toLocaleDateString('sv-SE').slice(0, 7)
)
const [selectedJournalYear, setSelectedJournalYear] = useState(
  new Date().getFullYear()
)

const saveJournal = () => {
  const text = journalDraft.trim()

  if (!text) return

  let updatedEntries: JournalEntry[]

  if (editingEntryId) {
    updatedEntries = journalEntries.map((entry) =>
      entry.id === editingEntryId
        ? { ...entry, text }
        : entry
    )
  } else {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
    }

    updatedEntries = [...journalEntries, newEntry]
  }

  setJournalEntries(updatedEntries)

  localStorage.setItem(
    'daylog-journal-entries',
    JSON.stringify(updatedEntries)
  )

  setJournalDraft('')
  setEditingEntryId(null)
}
const editJournal = (entry: JournalEntry) => {
  setJournalDraft(entry.text)
  setEditingEntryId(entry.id)

  document.querySelector('.journal')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const deleteJournal = (entryId: string) => {
  if (!window.confirm('이 기록을 삭제할까요?')) return

  const updatedEntries = journalEntries.filter(
    (entry) => entry.id !== entryId
  )

  setJournalEntries(updatedEntries)

  localStorage.setItem(
    'daylog-journal-entries',
    JSON.stringify(updatedEntries)
  )

  if (editingEntryId === entryId) {
    setJournalDraft('')
    setEditingEntryId(null)
  }
}

const cancelEditJournal = () => {
  setJournalDraft('')
  setEditingEntryId(null)
}

const getWeekDays = (date: Date) => {
  const sunday = new Date(date)
  sunday.setDate(sunday.getDate() - sunday.getDay())
  sunday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + index)
    return day
  })
}
const getWeekNumber = (date: Date) => {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7))

  const firstThursday = new Date(target.getFullYear(), 0, 4)
  firstThursday.setHours(0, 0, 0, 0)

  const weekNumber =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7
    )

  return {
    year: target.getFullYear(),
    week: weekNumber,
  }
}
const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDate = new Date(year, month, 0).getDate()

  const days: (Date | null)[] = []

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }

  for (let day = 1; day <= lastDate; day++) {
    days.push(new Date(year, month - 1, day))
  }

  return days
}

const filteredEntries = journalEntries.filter((entry) => {
  const entryDate = new Date(entry.createdAt)

  if (journalPeriod === '일별') {
    return (
      entryDate.toLocaleDateString('sv-SE') === selectedJournalDate
    )
  }

  if (journalPeriod === '주간') {
    const start = new Date(selectedJournalWeek + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    return entryDate >= start && entryDate < end
  }

  if (journalPeriod === '월간') {
    const [year, month] = selectedJournalMonth.split('-').map(Number)

    return (
      entryDate.getFullYear() === year &&
      entryDate.getMonth() === month - 1
    )
  }

  if (journalPeriod === '연간') {
    return entryDate.getFullYear() === selectedJournalYear
  }

  return true
})

const journalYears = Array.from(
  new Set(
    journalEntries.map((entry) =>
      new Date(entry.createdAt).getFullYear()
    )
  )
).sort((a, b) => b - a)
const selectedDateEntries = journalEntries.filter((entry) => {
  const entryDate = new Date(entry.createdAt).toLocaleDateString('sv-SE')
  return entryDate === selectedJournalDate
})
const selectedWeekDays = getWeekDays(
  new Date(selectedJournalWeek + 'T00:00:00')
)

const selectedWeekInfo = getWeekNumber(
  new Date(selectedJournalWeek + 'T00:00:00')
)
const [selectedYear, selectedMonth] = selectedJournalMonth.split('-').map(Number)
const selectedMonthDays = getMonthDays(selectedYear, selectedMonth)
const yearlyMonths = Array.from({ length: 12 }, (_, index) => ({
  year: selectedJournalYear,
  month: index + 1,
}))


  const tabs = ['main', 'today', 'health', 'school', 'diary']

    const handleAddPeriod = () => {
  if (!periodStartDate) {
    alert('생리 시작일을 입력해 줘!')
    return
  }

  if (periodEndDate && periodEndDate < periodStartDate) {
    alert('종료일은 시작일보다 빠를 수 없어!')
    return
  }

  if (periodEntries.some((entry) => entry.startDate === periodStartDate)) {
    alert('이미 기록된 시작일이야!')
    return
  }

  const updated = [
    ...periodEntries,
    {
      id: crypto.randomUUID(),
      startDate: periodStartDate,
      endDate: periodEndDate,
    },
  ].sort((a, b) => a.startDate.localeCompare(b.startDate))

  setPeriodEntries(updated)
  localStorage.setItem('daylog-period-entries', JSON.stringify(updated))

  setPeriodStartDate(new Date().toLocaleDateString('sv-SE'))
  setPeriodEndDate('')

  alert('생리 기록이 저장되었어!')
}
 const sortedPeriodEntries = [...periodEntries].sort(
  (a, b) => a.startDate.localeCompare(b.startDate)
)

const cycleLengths = sortedPeriodEntries.slice(1).map((entry, index) => {
  const previous = new Date(`${sortedPeriodEntries[index].startDate}T12:00:00`)
  const current = new Date(`${entry.startDate}T12:00:00`)

  return Math.round(
    (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
  )
})

const averageCycleLength =
  cycleLengths.length > 0
    ? Math.round(
        cycleLengths.reduce((sum, days) => sum + days, 0) /
          cycleLengths.length
      )
    : null

const latestPeriod =
  sortedPeriodEntries[sortedPeriodEntries.length - 1]

const nextPeriodDate =
  latestPeriod && averageCycleLength
    ? (() => {
        const [year, month, day] = latestPeriod.startDate.split('-').map(Number)
        return new Date(year, month - 1, day + averageCycleLength)
          .toLocaleDateString('sv-SE')
      })()
    : null

  const handleHealthSave = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)

  const getNumber = (name: string) => {
    const value = formData.get(name)
    return value === '' || value === null ? null : Number(value)
  }

  const targetDate = selectedHealthDate

  const meals = (['아침', '점심', '저녁', '간식'] as const)
    .map((type) => ({
      id: crypto.randomUUID(),
      type,
      name: String(formData.get(`meal-${type}`) || ''),
      calories: getNumber(`calories-${type}`),
      time: '',
    }))
    .filter((meal) => meal.name.trim() !== '')


  const existingEntry = healthEntries.find(
  (entry) => entry.date === targetDate
)
const sleepStart = String(formData.get('sleep-start') || '')
const sleepEnd = String(formData.get('sleep-end') || '')

let sleepHours: number | null = null

if (sleepStart && sleepEnd) {
  const [startHour, startMinute] = sleepStart.split(':').map(Number)
  const [endHour, endMinute] = sleepEnd.split(':').map(Number)

  const startMinutes = startHour * 60 + startMinute
  let endMinutes = endHour * 60 + endMinute

  // 자정을 넘겨서 기상한 경우
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60
  }

  sleepHours = Math.round(
    ((endMinutes - startMinutes) / 60) * 10
  ) / 10
}

  const newEntry: HealthEntry = {
    id: existingEntry?.id || crypto.randomUUID(),
    date: targetDate,
    weight: getNumber('weight'),
    bodyFat: getNumber('fat'),
    muscleMass: getNumber('muscle'),
    systolic: getNumber('systolic'),
    diastolic: getNumber('diastolic'),
    heartRate: getNumber('heart'),
    sleepStart: String(formData.get('sleep-start') || ''),
sleepEnd: String(formData.get('sleep-end') || ''),
sleepHours: sleepHours,
    water: getNumber('water') ?? 0,
    meals,
    memo: String(formData.get('memo') || ''),
    medications: existingEntry?.medications ?? [],
  }

  saveHealthEntries([
    ...healthEntries.filter((entry) => entry.date !== targetDate),
    newEntry,
  ])

  alert('건강 기록이 저장되었습니다!')
}
const handleDeleteHealthEntry = () => {
  if (!selectedHealthEntry) return

  const confirmed = confirm(
    `${selectedHealthDate} 건강 기록을 삭제할까?`
  )

  if (!confirmed) return

  const updatedEntries = healthEntries.filter(
    (entry) => entry.date !== selectedHealthDate
  )

  saveHealthEntries(updatedEntries)
  alert('건강 기록이 삭제되었어!')
}
  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">YOUR PERSONAL LIFE TRACKER</p>
          <h1>DAYLOG<span>.</span></h1>
        </div>
        <div className="date">
          {new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </header>

      <section className="welcome">
        <p>MY DAY, MY RECORD.</p>
        <h2>daily life record<br />lifestyle tracker</h2>
        <span>only for sanghee</span>
      </section>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="content">
        {activeTab === 'main' && (
  <>
    <div className="section-heading">
      <div>
        <p className="eyebrow">main page</p>
        <h2>personal dashboard</h2>
      </div>
      <span className="today-label">main</span>
    </div>

    <div className="cards">
      <article className="card">
        <span className="card-icon">🚭</span>
        <p>금연 카운터</p>
        <strong>금연 경과일</strong>
        <span className="card-description">금연 시작일을 설정해 주세요</span>
      </article>

      <article className="card">
        <span className="card-icon">📅</span>
        <p>이번 주 일정</p>
        <strong>주요 일정</strong>
        <span className="card-description">캘린더 연동 예정</span>
      </article>

      <article className="card">
        <span className="card-icon">🎯</span>
        <p>D-Day</p>
        <strong>다가오는 목표</strong>
        <span className="card-description">중요한 날짜를 등록해 주세요</span>
      </article>
    </div>
  </>
)}

{activeTab === 'today' && (
  <>
    <div className="section-heading">
      <div>
        <p className="eyebrow">DAILY PLAN</p>
        <h2>오늘의 할 일</h2>
      </div>
      <span className="today-label">TODAY</span>
    </div>

    <div className="cards">
      <article className="card">
        <span className="card-icon">📝</span>
        <p>오늘의 일정</p>
        <strong>하루 계획</strong>
        <span className="card-description">오늘의 일정과 할 일 관리</span>
      </article>
    </div>
  </>
)}



{activeTab === 'health' && (
  <>
    <div className="section-heading">
      <div>
        <p className="eyebrow">HEALTH TRACKING</p>
        <h2>나의 건강 기록</h2>
      </div>
      <span className="today-label">HEALTH</span>
    </div>

    <form
  key={selectedHealthDate}
  className="health-page"
  onSubmit={handleHealthSave}
>

      {/* 좌측 열 */}
      <div className="health-left">

        {/* 혈압 및 심박수 */}
        <section className="card">
          <h3>❤️ 혈압 · 심박수</h3>
          <label>수축기 혈압 (mmHg)</label>
<input
  id="health-systolic"
  name="systolic"
  type="number"
  placeholder="예: 120"
  defaultValue={selectedHealthEntry?.systolic ?? ''}
/>

<label>이완기 혈압 (mmHg)</label>
<input
  id="health-diastolic"
  name="diastolic"
  type="number"
  placeholder="예: 80"
  defaultValue={selectedHealthEntry?.diastolic ?? ''}
/>

<label>심박수 (bpm)</label>
<input
  id="health-heart"
  name="heart"
  type="number"
  placeholder="예: 70"
/>
        </section>

        {/* 수분 섭취 */}
        <section className="card">
          <h3>💧 수분 섭취</h3>
          <label>오늘 마신 물 (ml)</label>
<input
  id="health-water"
  name="water"
  type="number"
  placeholder="예: 1500"
  defaultValue={selectedHealthEntry?.water ?? ''}
/>

<label>하루 목표량 (ml)</label>
<input
  id="health-water-goal"
  name="water-goal"
  type="number"
  defaultValue="2000"
/>
        </section>

       
{/* 복약 관리 */}
<section className="card">
  <h3>💊 복약 관리</h3>

  <h4>새 약 등록</h4>

  <label>약 이름</label>
  <input
    type="text"
    value={newMedicationName}
    onChange={(e) => setNewMedicationName(e.target.value)}
    placeholder="약 이름"
  />

  <label>용량</label>
  <input
    type="text"
    value={newMedicationDose}
    onChange={(e) => setNewMedicationDose(e.target.value)}
    placeholder="예: 1정"
  />

  <label>복용 시간</label>
  <div className="medication-time-input">
    <input
      type="time"
      value={newMedicationTime}
      onChange={(e) => setNewMedicationTime(e.target.value)}
    />
    <button type="button" onClick={handleAddMedicationTime}>
      시간 추가
    </button>
  </div>

  <div className="medication-time-list">
    {newMedicationTimes.map((time) => (
      <span key={time}>
        {time}
        <button
          type="button"
          onClick={() =>
            setNewMedicationTimes(
              newMedicationTimes.filter((t) => t !== time)
            )
          }
        >
          ×
        </button>
      </span>
    ))}
  </div>

  <button type="button" onClick={handleAddMedication}>
    {editingMedicationId ? '수정 완료' : '+ 약 등록하기'}
  </button>

  {editingMedicationId && (
    <button
      type="button"
      onClick={() => {
        setEditingMedicationId(null)
        setNewMedicationName('')
        setNewMedicationDose('')
        setNewMedicationTimes([])
        setNewMedicationTime('')
      }}
    >
      수정 취소
    </button>
  )}

  <hr />

  <h4>복용 중인 약</h4>

  {medicationList.filter((med) => med.active).length === 0 ? (
    <p>등록된 약이 없어.</p>
  ) : (
    medicationList
      .filter((med) => med.active)
      .map((med) => (
        <div className="medication-item" key={med.id}>
          <strong>{med.name}</strong>
          <p>{med.dose}</p>

          <div className="medication-control-row">
            <div className="medication-checks">
              {med.times.map((time) => {
                const takenKey = `${today}|${time}`

                return (
                  <label key={time}>
                    <input
                      type="checkbox"
                      checked={med.takenTimes.includes(takenKey)}
                      onChange={(e) => {
                        const updated = medicationList.map((item) =>
                          item.id === med.id
                            ? {
                                ...item,
                                takenTimes: e.target.checked
                                  ? [...item.takenTimes, takenKey]
                                  : item.takenTimes.filter(
                                      (t) => t !== takenKey
                                    ),
                              }
                            : item
                        )
                        saveMedicationList(updated)
                      }}
                    />
                    {time} 복용 완료
                  </label>
                )
              })}
            </div>

            <div className="medication-buttons">
              <button type="button" onClick={() => handleEditMedication(med)}>
                수정
              </button>

              <button
                type="button"
                onClick={() =>
                  saveMedicationList(
                    medicationList.map((item) =>
                      item.id === med.id
                        ? { ...item, active: false }
                        : item
                    )
                  )
                }
              >
                보관
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('이 약을 영구 삭제할까?')) {
                    saveMedicationList(
                      medicationList.filter((item) => item.id !== med.id)
                    )
                  }
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ))
  )}

  <hr />

  <h4>📦 복약 보관함</h4>

  {medicationList.filter((med) => !med.active).length === 0 ? (
    <p>보관 중인 약이 없어.</p>
  ) : (
    medicationList
      .filter((med) => !med.active)
      .map((med) => (
        <div className="medication-item" key={med.id}>
          <strong>{med.name}</strong>
          <p>{med.dose}</p>

          <div className="medication-buttons">
            <button type="button" onClick={() => handleEditMedication(med)}>
              수정
            </button>

            <button
              type="button"
              onClick={() =>
                saveMedicationList(
                  medicationList.map((item) =>
                    item.id === med.id
                      ? { ...item, active: true }
                      : item
                  )
                )
              }
            >
              복용
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('이 약을 영구 삭제할까?')) {
                  saveMedicationList(
                    medicationList.filter((item) => item.id !== med.id)
                  )
                }
              }}
            >
              삭제
            </button>
          </div>
        </div>
      ))
  )}
</section>

      </div>

      {/* 우측 열 */}
      <div className="health-right">

        {/* 식단 관리 */}
        <section className="card">
  <h3>🍽️ 식단 관리</h3>

  {(['아침', '점심', '저녁', '간식'] as const).map((meal) => (
    <div key={meal} className="health-meal">
      <h4>{meal}</h4>

      <label>음식명</label>
      <input
        id={`health-meal-${meal}`}
        name={`meal-${meal}`}
        type="text"
        placeholder={`${meal} 메뉴`}
        defaultValue={
  selectedHealthEntry?.meals.find((m) => m.type === meal)?.name ?? ''
}
      />

      <label>칼로리 (kcal)</label>
      <input
        id={`health-calories-${meal}`}
        name={`calories-${meal}`}
        type="number"
        placeholder="예: 500"
        defaultValue={
  selectedHealthEntry?.meals.find((m) => m.type === meal)?.calories ?? ''
}
      />
    </div>
  ))}
</section>

      </div>

      {/* 하단 전체 너비 */}
      <div className="health-bottom">

        {/* 체중 및 체성분 */}
        <section className="card">
          <h3>⚖️ 체중 · 체성분</h3>

          <label>체중 (kg)</label>
<input
  id="health-weight"
  name="weight"
  type="number"
  step="0.1"
  placeholder="예: 60.5"
  defaultValue={selectedHealthEntry?.weight ?? ''}
/>

<label>체지방률 (%)</label>
<input
  id="health-fat"
  name="fat"
  type="number"
  step="0.1"
  placeholder="예: 22.5"
  defaultValue={selectedHealthEntry?.bodyFat ?? ''}
/>

<label>골격근량 (kg)</label>
<input
  id="health-muscle"
  name="muscle"
  type="number"
  step="0.1"
  placeholder="예: 25.0"
  defaultValue={selectedHealthEntry?.muscleMass ?? ''}
/>
        </section>

        {/* 수면 */}
        <section className="card">
          <h3>🌙 수면 관리</h3>

          <label>취침 시간</label>
<input
  id="health-sleep-start"
  name="sleep-start"
  type="time"
  defaultValue={selectedHealthEntry?.sleepStart ?? ''}
/>

<label>기상 시간</label>
<input
  id="health-sleep-end"
  name="sleep-end"
  type="time"
  defaultValue={selectedHealthEntry?.sleepEnd ?? ''}
/>
        </section>

        {/* 건강 메모 */}
        <section className="card">
          <h3>📝 건강 메모</h3>

          <textarea
  id="health-memo"
  name="memo"
  rows={5}
  placeholder="오늘의 증상, 컨디션, 특이사항 등을 기록하세요."
  defaultValue={selectedHealthEntry?.memo ?? ''}
/>
        </section>

      </div>
      <button type="submit" className="health-save-button">
  건강 기록 저장
</button>
    </form>

{/* 건강 기록 조회 */}
<section className="card health-history">
  <h3>📅 건강 기록 조회</h3>

  {/* 월 이동 */}
  <div className="health-calendar-header">
    <button
      type="button"
      onClick={() =>
        setHealthCalendarDate(
          new Date(
            healthCalendarDate.getFullYear(),
            healthCalendarDate.getMonth() - 1,
            1
          )
        )
      }
    >
      ←
    </button>

    <h4>
      {healthCalendarDate.getFullYear()}년{' '}
      {healthCalendarDate.getMonth() + 1}월
    </h4>

    <button
      type="button"
      onClick={() =>
        setHealthCalendarDate(
          new Date(
            healthCalendarDate.getFullYear(),
            healthCalendarDate.getMonth() + 1,
            1
          )
        )
      }
    >
      →
    </button>
  </div>

  {/* 요일 */}
  <div className="health-calendar-grid">
    {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
      <div className="health-calendar-weekday" key={day}>
        {day}
      </div>
    ))}

    {/* 월 시작 전 빈칸 */}
    {Array.from(
      {
        length: new Date(
          healthCalendarDate.getFullYear(),
          healthCalendarDate.getMonth(),
          1
        ).getDay(),
      },
      (_, index) => (
        <div key={`empty-${index}`} />
      )
    )}

    {/* 날짜 */}
    {Array.from(
      {
        length: new Date(
          healthCalendarDate.getFullYear(),
          healthCalendarDate.getMonth() + 1,
          0
        ).getDate(),
      },
      (_, index) => {
        const day = index + 1

        const date = new Date(
          healthCalendarDate.getFullYear(),
          healthCalendarDate.getMonth(),
          day
        ).toLocaleDateString('sv-SE')

        const hasEntry = healthEntries.some(
          (entry) => entry.date === date
        )

        const isSelected = selectedHealthDate === date

        return (
          <button
            key={date}
            type="button"
            className={`health-calendar-day ${
              isSelected ? 'selected' : ''
            }`}
            onClick={() => setSelectedHealthDate(date)}
          >
            <span>{day}</span>
            {hasEntry && <span className="health-record-dot" />}
          </button>
        )
      }
    )}
  </div>

  <hr />

  {/* 선택한 날짜의 기록 */}
  <div className="health-record-detail">
    <h4>
      {new Date(`${selectedHealthDate}T12:00:00`).toLocaleDateString(
        'ko-KR',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        }
      )}
    </h4>

    {selectedHealthEntry ? (
      <>
        <div className="health-record-grid">
          <div>
            <span>체중</span>
            <strong>
              {selectedHealthEntry.weight ?? '-'} kg
            </strong>
          </div>

          <div>
            <span>체지방률</span>
            <strong>
              {selectedHealthEntry.bodyFat ?? '-'} %
            </strong>
          </div>

          <div>
            <span>골격근량</span>
            <strong>
              {selectedHealthEntry.muscleMass ?? '-'} kg
            </strong>
          </div>

          <div>
            <span>혈압</span>
            <strong>
              {selectedHealthEntry.systolic ?? '-'} /{' '}
              {selectedHealthEntry.diastolic ?? '-'}
            </strong>
          </div>

          <div>
            <span>심박수</span>
            <strong>
              {selectedHealthEntry.heartRate ?? '-'} bpm
            </strong>
          </div>

          <div>
            <span>수분 섭취</span>
            <strong>
              {selectedHealthEntry.water} ml
            </strong>
          </div>

          <div>
            <span>수면 시간</span>
            <strong>
              {selectedHealthEntry.sleepHours ?? '-'} 시간
            </strong>
          </div>
        </div>

        <hr />

        <h4>🍽️ 식사 기록</h4>

        {selectedHealthEntry.meals.length > 0 ? (
          selectedHealthEntry.meals.map((meal) => (
            <p key={meal.id}>
              <strong>{meal.type}</strong> · {meal.name}
              {meal.calories !== null &&
                ` (${meal.calories} kcal)`}
            </p>
          ))
        ) : (
          <p>식사 기록이 없어.</p>
        )}

        <hr />

        <h4>📝 건강 메모</h4>
        <p>
          {selectedHealthEntry.memo || '작성된 메모가 없어.'}
        </p>
      <div className="health-record-actions">
</div>
<div className="health-record-actions">
  <button
    type="button"
    onClick={() => {
      document.querySelector('.health-page')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }}
  >
    수정하기
  </button>

  <button
    type="button"
    onClick={handleDeleteHealthEntry}
  >
    기록 삭제
  </button>
</div>
      </>
    ) : (
      <p>이 날짜에는 저장된 건강 기록이 없어.</p>
    )}
  </div>
</section>
{/* 생리주기 기록 */}
<section className="card health-period">
  <h3>🌸 생리주기 기록</h3>

  <label>생리 시작일</label>
  <input
    type="date"
    value={periodStartDate}
    onChange={(e) => setPeriodStartDate(e.target.value)}
  />

  <label>생리 종료일</label>
  <input
    type="date"
    value={periodEndDate}
    min={periodStartDate}
    onChange={(e) => setPeriodEndDate(e.target.value)}
  />

  <button type="button" onClick={handleAddPeriod}>
    생리 기록 저장
  </button>

  <hr />

  <h4>📊 주기 분석</h4>

  <div className="period-summary">
    <div>
      <span>평균 생리 주기</span>
      <strong>
        {averageCycleLength !== null
          ? `${averageCycleLength}일`
          : '기록 부족'}
      </strong>
    </div>

    <div>
      <span>다음 생리 예상일</span>
      <strong>
        {nextPeriodDate
          ? new Date(`${nextPeriodDate}T12:00:00`).toLocaleDateString(
              'ko-KR',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )
          : '기록 부족'}
      </strong>
    </div>
  </div>

  <hr />

  <h4>📅 생리 기록 내역</h4>

  {sortedPeriodEntries.length === 0 ? (
    <p>아직 등록된 생리 기록이 없어.</p>
  ) : (
    sortedPeriodEntries.map((entry: MenstrualEntry) => (
      <div className="period-item" key={entry.id}>
        <div>
          <strong>{entry.startDate}</strong>
          <p>
            종료일: {entry.endDate || '미입력'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('이 생리 기록을 삭제할까?')) {
              const updated = periodEntries.filter(
                (item:MenstrualEntry) => item.id !== entry.id
              )

              setPeriodEntries(updated)
              localStorage.setItem(
                'daylog-period-entries',
                JSON.stringify(updated)
              )
            }
          }}
        >
          삭제
        </button>
      </div>
    ))
  )}
</section>
  </>
)}

{activeTab === 'school' && (
  <>
    <div className="section-heading">
      <div>
        <p className="eyebrow">SCHOOL LIFE</p>
        <h2>학교 생활</h2>
      </div>
      <span className="today-label">SCHOOL</span>
    </div>

    <div className="cards">
      <article className="card">
        <span className="card-icon">📚</span>
        <p>학업 관리</p>
        <strong>수업 및 과제</strong>
        <span className="card-description">
          수업, 과제, 시험 일정 관리
        </span>
      </article>
    </div>
  </>
)}
  
{activeTab === 'diary' && (
  <>
   <section className="journal">
    <div className="section-heading">
     <div>
      <p className="eyebrow">DAILY JOURNAL</p>
              <h2>오늘 하루는 어땠어?</h2>
            </div>
            <span className="today-label">diary</span>
          </div>

              <textarea
                placeholder="오늘의 생각과 순간들을 자유롭게 기록해 봐."
                value={journalDraft}
                onChange={(e) => setJournalDraft(e.target.value)} />

              <div className="journal-actions">
                <span>{journalDraft.length}자</span>

                {editingEntryId && (
                  <button onClick={cancelEditJournal}>
                    취소
                  </button>
                )}

                <button onClick={saveJournal}>
                  {editingEntryId ? '수정 완료' : '저장하기'}
                </button>
              </div>

              <div className="journal-history">
                <h3>나의 기록</h3>

                <div className="journal-period-tabs">
                  {['일별', '주간', '월간', '연간'].map((period) => (
                    <button
                      key={period}
                      className={journalPeriod === period ? 'period-tab active' : 'period-tab'}
                      onClick={() => setJournalPeriod(period)}
                    >
                      {period}
                    </button>
                  ))}
                </div>
                {journalPeriod === '일별' ? (
                  <div className="weekly-header">
                    <button
                      onClick={() => {
                        const date = new Date(selectedJournalDate + 'T00:00:00')
                        date.setDate(date.getDate() - 1)
                        setSelectedJournalDate(date.toLocaleDateString('sv-SE'))
                      } }
                    >
                      ←
                    </button>

                    <h3>
                      {new Date(selectedJournalDate + 'T00:00:00').toLocaleDateString(
                        'ko-KR',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        }
                      )}
                    </h3>

                    <button
                      onClick={() => {
                        const date = new Date(selectedJournalDate + 'T00:00:00')
                        date.setDate(date.getDate() + 1)
                        setSelectedJournalDate(date.toLocaleDateString('sv-SE'))
                      } }
                    >
                      →
                    </button>
                  </div>
                ) : journalPeriod === '주간' ? (
                  <div className="weekly-journal">
                    <div className="weekly-header">
                      <button
                        onClick={() => {
                          const date = new Date(selectedJournalWeek + 'T00:00:00')
                          date.setDate(date.getDate() - 7)
                          setSelectedJournalWeek(date.toLocaleDateString('sv-SE'))
                          setSelectedJournalDate(date.toLocaleDateString('sv-SE'))
                        } }
                      >
                        ←
                      </button>
                      <h3>
                        {selectedWeekInfo.year}년 {selectedWeekInfo.week}주차
                      </h3>
                      <button
                        onClick={() => {
                          const date = new Date(selectedJournalWeek + 'T00:00:00')
                          date.setDate(date.getDate() + 7)
                          setSelectedJournalWeek(date.toLocaleDateString('sv-SE'))
                          setSelectedJournalDate(date.toLocaleDateString('sv-SE'))
                        } }
                      >
                        →
                      </button>
                    </div>
                    <div className="journal-date-list">
                      {selectedWeekDays.map((day) => {
                        const date = day.toLocaleDateString('sv-SE')
                        const hasEntry = journalEntries.some(
                          (entry) => new Date(entry.createdAt).toLocaleDateString('sv-SE') === date
                        )
                        return (
                          <button
                            key={date}
                            className={selectedJournalDate === date
                              ? 'journal-date active'
                              : 'journal-date'}
                            onClick={() => {
                              setSelectedJournalDate(date)
                              setSelectedJournalWeek(date)
                            } }
                          >
                            {day.toLocaleDateString('ko-KR', {
                              weekday: 'short',
                              day: 'numeric',
                            })}
                            {hasEntry ? ' ·' : ''}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : journalPeriod === '월간' ? (
                  <div className="monthly-journal">
                    <div className="weekly-header">
                      <button
                        onClick={() => {
                          const date = new Date(selectedYear, selectedMonth - 2, 1)
                          setSelectedJournalMonth(
                            date.toLocaleDateString('sv-SE').slice(0, 7)
                          )
                        } }
                      >
                        ←
                      </button>

                      <h3>
                        {selectedYear}년 {selectedMonth}월
                      </h3>

                      <button
                        onClick={() => {
                          const date = new Date(selectedYear, selectedMonth, 1)
                          setSelectedJournalMonth(
                            date.toLocaleDateString('sv-SE').slice(0, 7)
                          )
                        } }
                      >
                        →
                      </button>
                    </div>

                    <div className="monthly-calendar">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                        <div className="calendar-weekday" key={day}>
                          {day}
                        </div>
                      ))}

                      {selectedMonthDays.map((day, index) => {
                        if (!day) {
                          return <div className="calendar-empty" key={`empty-${index}`} />
                        }

                        const date = day.toLocaleDateString('sv-SE')
                        const isToday = date === today

                        const hasEntry = journalEntries.some(
                          (entry) => new Date(entry.createdAt).toLocaleDateString('sv-SE') === date
                        )

                        return (
                          <button
                            key={date}
                            className={selectedJournalDate === date
                              ? 'calendar-day active'
                              : isToday
                                ? 'calendar-day today'
                                : 'calendar-day'}
                            onClick={() => {
                              setSelectedJournalDate(date)
                              setSelectedJournalWeek(date.slice(0, 7))
                            } }
                          >
                            <span>{day.getDate()}</span>
                            {hasEntry && <span className="calendar-dot">·</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                ) : journalPeriod === '연간' ? (
                  <div className="yearly-journal">
                    {showYearMonths ? (
                      <>
                        <div className="weekly-header">
                          <button onClick={() => setShowYearMonths(false)}>
                            ←
                          </button>

                          <h3>{selectedJournalYear}년</h3>
                        </div>

                        <div className="yearly-months">
                          {yearlyMonths.map(({ year, month }) => {
                            const days = getMonthDays(year, month)

                            return (
                              <div className="yearly-month" key={`${year}-${month}`}>
                                <button
                                  className="yearly-month-title"
                                  onClick={() => {
                                    setSelectedJournalMonth(
                                      `${year}-${String(month).padStart(2, '0')}`
                                    )
                                    setJournalPeriod('월간')
                                  } }
                                >
                                  {month}월
                                </button>

                                <div className="yearly-calendar-grid">
                                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                                    <div className="yearly-weekday" key={day}>
                                      {day}
                                    </div>
                                  ))}

                                  {days.map((day, index) => {
                                    if (!day) {
                                      return (
                                        <div
                                          className="yearly-calendar-empty"
                                          key={`empty-${index}`} />
                                      )
                                    }

                                    const date = day.toLocaleDateString('sv-SE')
                                    const hasEntry = journalEntries.some(
                                      (entry) => new Date(entry.createdAt).toLocaleDateString('sv-SE') === date
                                    )

                                    return (
                                      <button
                                        key={date}
                                        className={selectedJournalDate === date
                                          ? 'yearly-day active'
                                          : date === today
                                            ? 'yearly-day today'
                                            : 'yearly-day'}
                                        onClick={() => setSelectedJournalDate(date)}
                                      >
                                        {day.getDate()}
                                        {hasEntry && <span className="yearly-dot">·</span>}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="year-buttons">
                        {journalYears.map((year) => (
                          <button
                            key={year}
                            className="year-button"
                            onClick={() => {
                              setSelectedJournalYear(year)
                              setShowYearMonths(true)
                            } }
                          >
                            {year}년
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (

                  <>
                    <div className="journal-date-list">
                      {Array.from(
                        new Set(
                          filteredEntries.map((entry) => new Date(entry.createdAt).toLocaleDateString('sv-SE')
                          )
                        )
                      )
                        .sort((a, b) => b.localeCompare(a))
                        .map((date) => (
                          <button
                            key={date}
                            className={selectedJournalDate === date
                              ? 'journal-date active'
                              : 'journal-date'}
                            onClick={() => setSelectedJournalDate(date)}
                          >
                            {new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </button>
                        ))}
                    </div>
                  </>
                )}

                {journalPeriod !== '연간' && (
                  Object.entries(
                    selectedDateEntries
                      .sort((a, b) => new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                      )
                      .reduce((groups, entry) => {
                        const date = new Date(entry.createdAt).toLocaleDateString('sv-SE')

                        if (!groups[date]) {
                          groups[date] = []
                        }

                        groups[date].push(entry)
                        return groups
                      }, {} as Record<string, typeof filteredEntries>)
                  )
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([date, entries]) => (
                      <div className="journal-day" key={date}>
                        {journalPeriod !== '일별' && (
                          <h4>
                            {new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long',
                            })}
                          </h4>
                        )}

                        {entries.map((entry) => (
                          <article className="journal-entry" key={entry.id}>
                            <div className="entry-time">
                              {new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })}
                            </div>

                            <p>{entry.text}</p>

                            <div className="entry-actions">
                              <button onClick={() => editJournal(entry)}>
                                수정
                              </button>

                              <button onClick={() => deleteJournal(entry.id)}>
                                삭제
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ))
                )}
              </div>
            </section>
          </>
)}

      </section>

      <footer>DAYLOG · A LITTLE RECORD OF YOUR LIFE</footer>
    </main>
  )
}

export default App
