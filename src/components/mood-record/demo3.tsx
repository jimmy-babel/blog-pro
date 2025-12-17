// 用moment格式化日期 实现自定义日历
import React, { useState, useMemo } from 'react'
import moment, { Moment } from 'moment';
type Props = {}

// 心情类型定义
type MoodType = {
  emoji: string;
  label?: string;
  note?: string;
};

// 心情记录类型定义
type MoodRecordType = {
  date: string; // YYYY-MM-DD 格式
  // mood: MoodType;
  note?: string;
  emoji?: string;
};

// 预定义心情列表
const MOODS: MoodType[] = [ //emoji列表
  { emoji: '😄', label: '开心', note: '开心' },
  { emoji: '😐', label: '平静', note: '平静' },
  { emoji: '😎', label: '酷', note: '酷' },
  { emoji: '😊', label: '愉快', note: '愉快' },
  { emoji: '😢', label: '难过', note: '难过' },
  { emoji: '😡', label: '生气', note: '生气' },
  { emoji: '🤔', label: '思考', note: '思考' },
  { emoji: '🎉', label: '兴奋', note: '兴奋' },
];

// 示例心情记录数据
const sampleMoodRecords: MoodRecordType[] = [ //模拟数据
  { date: '2025-12-01', emoji: '😄' , note: '第一天是个好天气'},
  { date: '2025-12-02', emoji: '😄' , note: '第二天是个好天气'},
  { date: '2025-12-03', emoji: '😎' , note: '第三天是个好天气'},
  { date: '2025-12-04', emoji: '😊' , note: '第四天是个好天气'},
  { date: '2025-12-05', emoji: '😄' , note: '第五天是个好天气'},
  { date: '2025-12-06', emoji: '😢' , note: '第六天是个好天气'},
  { date: '2025-12-07', emoji: '🎉' , note: '第七天是个好天气'},
  { date: '2025-12-08', emoji: '😄' , note: '第八天是个好天气'},
  { date: '2025-12-09', emoji: '😢' , note: '第九天是个好天气'},
  { date: '2025-12-10', emoji: '😢' , note: '第十天是个好天气'},
];

const MoodRecord = (props: Props) => {
  const [currentDate, setCurrentDate] = useState<Moment>(moment('2025-12'));
  const [moodRecords, setMoodRecords] = useState<MoodRecordType[]>(sampleMoodRecords);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  // 生成日历数据
  const calendarData = useMemo(() => {
    const year = currentDate.year();
    const month = currentDate.month();
    
    // 获取当月第一天是星期几（0-6，0是周日）
    const firstDayOfMonth = moment([year, month, 1]).day();
    // 获取当月有多少天
    const daysInMonth = currentDate.daysInMonth();
    //跨年的处理，上个月是11月
    const prevMonth = month === 0 ? 11 : month - 1; 
    // 获取上月有多少天
    const daysInPrevMonth = moment([year, prevMonth, 1]).daysInMonth(); //获取上月有多少天
    const calendar = []; // 存储日历数据的数组
    console.log('日历显示跨月份天数：',firstDayOfMonth,daysInMonth,42-daysInMonth-firstDayOfMonth);
    // 添加上月的日期
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      calendar.push({
        date,
        month: 'prev',
        fullDate: moment([year, prevMonth, date]).format('YYYY-MM-DD'),
      });
    }
    
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = i;
      calendar.push({
        date,
        month: 'current',
        fullDate: moment([year, month, date]).format('YYYY-MM-DD'),
      });
    }
    
    // 添加下月的日期，补满6行
    const remainingDays = 42 - calendar.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = i;
      calendar.push({
        date,
        month: 'next',
        fullDate: moment([year, month + 1, date]).format('YYYY-MM-DD'),
      });
    }
    console.log('calendar', calendar);
    return calendar;
  }, [currentDate]);

  // 获取某天的心情记录
  const getMoodForDate = (date: string): MoodRecordType | null => {
    const record = moodRecords.find(record => record.date === date);
    return record || null;
    // return record ? record : null;
    // return record ? record.mood : null;
  };

  // 处理日期点击
  const handleDateClick = (date: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    
    setSelectedDate(date);
    setShowMoodPicker(!showMoodPicker || selectedDate !== date);
  };

  // 处理心情选择
  const handleMoodSelect = (mood: MoodType) => {
    if (!selectedDate) return;
    
    // 检查是否已有该日期的记录
    const existingIndex = moodRecords.findIndex(record => record.date === selectedDate);
    
    let newRecords;
    if (existingIndex >= 0) {
      // 更新现有记录
      newRecords = [...moodRecords];
      newRecords[existingIndex] = { ...newRecords[existingIndex], emoji: mood.emoji, note: mood.note };
    } else {
      // 添加新记录
      newRecords = [...moodRecords, { date: selectedDate, emoji: mood.emoji, note: mood.note }];
    }
    
    setMoodRecords(newRecords);
    setShowMoodPicker(false);
  };

  // 切换到上个月
  const prevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, 'month'));
    setShowMoodPicker(false);
  };

  // 切换到下个月
  const nextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, 'month'));
    setShowMoodPicker(false);
  };

  // 星期几的标签
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">心情记录日历</h2>
        <p className="text-gray-500">点击日期选择心情</p>
      </div>
      
      {/* 日历头部 */}
      <div className="flex justify-between items-center mb-4 bg-gray-800 text-white p-3 rounded-lg">
        <button 
          onClick={prevMonth} 
          className="text-xl hover:bg-gray-700 p-2 rounded-full transition-colors"
        >
          &lt;
        </button>
        <h3 className="text-xl font-semibold">{currentDate.format('YYYY年MM月')}</h3>
        <button 
          onClick={nextMonth} 
          className="text-xl hover:bg-gray-700 p-2 rounded-full transition-colors"
        >
          &gt;
        </button>
      </div>
      
      {/* 星期几标签 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-2">
        {calendarData.map((day, index) => {
          const mood = getMoodForDate(day.fullDate);
          const isSelected = selectedDate === day.fullDate;
          const isCurrentMonth = day.month === 'current';
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(day.fullDate, isCurrentMonth)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                ${isCurrentMonth ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-400 cursor-default'}
                ${isSelected ? 'ring-2 ring-yellow-400 scale-105' : ''}
              `}
            >
              <div className="text-sm">{day.date}</div>
              {mood && (
                <div className="text-2xl mt-1">{mood.emoji}</div>
              )}
              {/* 显示红点标记 */}
              {isCurrentMonth && !mood && (
                <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 心情选择器 */}
      {showMoodPicker && selectedDate && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
          <h4 className="text-lg font-semibold mb-3">
            选择 {moment(selectedDate).format('YYYY-MM-DD')} 的心情
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {MOODS.map((mood, index) => (
              <button
                key={index}
                onClick={() => handleMoodSelect(mood)}
                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-3xl mb-1">{mood.emoji}</div>
                <div className="text-sm">{mood.label}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowMoodPicker(false)}
            className="mt-4 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodRecord;