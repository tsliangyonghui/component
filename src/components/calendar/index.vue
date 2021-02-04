<template>
  <div class="el-calendar">
    <div class="el-calendar__header">
      <div class="el-calendar__title">
        {{ i18nDate }}
      </div>
      <div class="el-calendar__button-group" v-if="validatedRange.length === 0">
        <m-button type="plain" size="mini" @click="selectDate('prev-month')">
          {{ t('el.datepicker.prevMonth') }}
        </m-button>
        <m-button type="plain" size="mini" @click="selectDate('today')">
          {{ t('el.datepicker.today') }}
        </m-button>
        <m-button type="plain" size="mini" @click="selectDate('next-month')">
          {{ t('el.datepicker.nextMonth') }}
        </m-button>
      </div>
    </div>
    <div class="el-calendar__body" v-if="validatedRange.length === 0" key="no-range">
      <date-table :date="date" :selected-day="realSelectedDay" :first-day-of-week="realFirstDayOfWeek" @pick="pickDay" />
    </div>
  </div>
</template>

<script>
import Locale from '@/mixins/locale'
import { validateRangeInOneMonth } from '@/utils/date-util'
import fecha from '@/utils/date'
import DateTable from './date-table'
const oneDay = 86400000
export default {
  name: 'MCalendar',
  mixins: [Locale],
  components: {
    DateTable
  },
  props: {
    value: [Date, String, Number],
    range: {
      type: Array,
      validator(range) {
        if (Array.isArray(range)) {
          return range.length === 2 && range.every(
            item => typeof item === 'string' ||
              typeof item === 'number' ||
              item instanceof Date)
        } else {
          return true
        }
      }
    },
    firstDayOfWeek: {
      type: Number,
      default: 1
    }
  },
  provide() {
    return {
      mCalendar: this
    }
  },
  data() {
    return {
      selectedDay: '',
      now: new Date()
    }
  },
  computed: {
    prevMonthDatePrefix() {
      const temp = new Date(this.date.getTime())
      temp.setDate(0)
      return fecha.format(temp, 'yyyy-MM')
    },

    curMonthDatePrefix() {
      return fecha.format(this.date, 'yyyy-MM')
    },

    nextMonthDatePrefix() {
      const temp = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1)
      return fecha.format(temp, 'yyyy-MM')
    },
    formatedToday() {
      return fecha.format(this.now, 'yyyy-MM-dd')
    },
    formatedDate() {
      return fecha.format(this.date, 'yyyy-MM-dd')
    },
    realSelectedDay: {
      get() {
        if (!this.value) return this.selectedDay
        return this.formatedDate
      },
      set(val) {
        this.selectedDay = val
        const date = new Date(val)
        this.$emit('input', date)
      }
    },
    date() {
      if (!this.value) {
        if (this.realSelectedDay) {
          const d = this.selectedDay.split('-')
          return new Date(d[0], d[1] - 1, d[2])
        } else if (this.validatedRange.length) {
          return this.validatedRange[0][0]
        }
        return this.now
      } else {
        return this.toDate(this.value)
      }
    },
    i18nDate() {
      const year = this.date.getFullYear()
      const month = this.date.getMonth() + 1
      return `${year} ${this.t('el.datepicker.year')} ${this.t('el.datepicker.month' + month)}`
    },
    validatedRange() {
      let range = this.range
      if (!range) return []
      range = range.reduce((prev, val, index) => {
        const date = this.toDate(val)
        if (this.rangeValidator(date, index === 0)) {
          prev = prev.concat(date)
        }
        return prev
      }, [])
      if (range.length === 2) {
        const [start, end] = range
        if (start > end) {
          console.warn('[ElementCalendar]end time should be greater than start time')
          return []
        }
        // start time and end time in one month
        if (validateRangeInOneMonth(start, end)) {
          return [
            [start, end]
          ]
        }
        const data = []
        let startDay = new Date(start.getFullYear(), start.getMonth() + 1, 1)
        const lastDay = this.toDate(startDay.getTime() - oneDay)
        if (!validateRangeInOneMonth(startDay, end)) {
          console.warn('[ElementCalendar]start time and end time interval must not exceed two months')
          return []
        }
        // 第一个月的时间范围
        data.push([
          start,
          lastDay
        ])
        // 下一月的时间范围，需要计算一下该月的第一个周起始日
        const firstDayOfWeek = this.realFirstDayOfWeek
        const nextMontFirstDay = startDay.getDay()
        let interval = 0
        if (nextMontFirstDay !== firstDayOfWeek) {
          if (firstDayOfWeek === 0) {
            interval = 7 - nextMontFirstDay
          } else {
            interval = firstDayOfWeek - nextMontFirstDay
            interval = interval > 0 ? interval : 7 + interval
          }
        }
        startDay = this.toDate(startDay.getTime() + interval * oneDay)
        if (startDay.getDate() < end.getDate()) {
          data.push([
            startDay,
            end
          ])
        }
        return data
      }
      return []
    },
    realFirstDayOfWeek() {
      if (this.firstDayOfWeek < 1 || this.firstDayOfWeek > 6) {
        return 0
      }
      return Math.floor(this.firstDayOfWeek)
    }
  },
  methods: {
    selectDate(type) {
      let day = ''
      if (type === 'prev-month') {
        day = `${this.prevMonthDatePrefix}-01`
      } else if (type === 'next-month') {
        day = `${this.nextMonthDatePrefix}-01`
      } else {
        day = this.formatedToday
      }

      if (day === this.formatedDate) return
      this.pickDay(day)
    },
    pickDay(day) {
      this.realSelectedDay = day
    },
    toDate(val) {
      if (!val) {
        throw new Error('invalid val')
      }
      return val instanceof Date ? val : new Date(val)
    }
  }
}
</script>
<style>
.el-calendar {
  background-color: #fff;
}
.el-calendar__header {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}
.el-calendar__body {
  padding: 12px 20px 35px;
}

.el-calendar-table {
  table-layout: fixed;
  width: 100%;
}

.el-calendar-table thead th {
  padding: 12px 0;
  color: #606266;
  font-weight: 400;
}

.el-calendar-table:not(.is-range) td.next,
.el-calendar-table:not(.is-range) td.prev {
  color: #c0c4cc;
}

.el-calendar-table td {
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  vertical-align: top;
  transition: background-color 0.2s ease;
}

.el-calendar-table td.is-selected {
  background-color: #f2f8fe;
}

.el-calendar-table td.is-today {
  color: #409eff;
}

.el-calendar-table tr:first-child td {
  border-top: 1px solid #ebeef5;
}

.el-calendar-table tr td:first-child {
  border-left: 1px solid #ebeef5;
}

.el-calendar-table tr.el-calendar-table__row--hide-border td {
  border-top: none;
}

.el-calendar-table .el-calendar-day {
  box-sizing: border-box;
  padding: 8px;
  height: 85px;
}

.el-calendar-table .el-calendar-day:hover {
  cursor: pointer;
  background-color: #f2f8fe;
}
</style>