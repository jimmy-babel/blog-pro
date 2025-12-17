// rc-calendar 日历组件
import React, { useState } from 'react'
import moment, { Moment } from 'moment';
import Calendar from 'rc-calendar';
import 'rc-calendar/assets/index.css';

// 自定义样式
const customStyles = `
  /* 日历容器 */
  .rc-calendar-container {
    width: 100%;
    margin: 0 auto;
  }
  
  /* 日历头部 */
  .mood-calendar .mood-calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1f2937;
    color: white;
    padding: 12px;
    border-radius: 0.5rem 0.5rem 0 0;
    margin-bottom: 0;
  }
  
  /* 修复月份选择器的垂直排列问题 */
  .mood-calendar .mood-calendar-month-select {
    display: inline-block !important;
    width: auto !important;
    margin-right: 8px;
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    background: none !important;
    border: none !important;
    color: white !important;
    cursor: pointer;
  }
  
  .mood-calendar .mood-calendar-year-select {
    display: inline-block !important;
    width: auto !important;
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    background: none !important;
    border: none !important;
    color: white !important;
    cursor: pointer;
  }
  
  /* 修复年份显示异常问题 */
  .mood-calendar .mood-calendar-year-select select {
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    background: none !important;
    border: none !important;
    color: white !important;
  }
  
  .mood-calendar .mood-calendar-month-select select {
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    background: none !important;
    border: none !important;
    color: white !important;
  }
  
  /* 修复月份选择器选项样式 */
  .mood-calendar .mood-calendar-month-select option,
  .mood-calendar .mood-calendar-year-select option {
    color: black !important;
    background-color: white !important;
  }
  
  .mood-calendar .mood-calendar-prev-month-btn,
  .mood-calendar .mood-calendar-next-month-btn {
    color: white;
    font-size: 1.25rem;
    padding: 0.5rem;
    border-radius: 9999px;
    transition: background-color 0.2s;
  }
  
  .mood-calendar .mood-calendar-prev-month-btn:hover,
  .mood-calendar .mood-calendar-next-month-btn:hover {
    background-color: #374151;
  }
  
  /* 星期几标签 */
  .mood-calendar .mood-calendar-week-number,
  .mood-calendar .mood-calendar-week-day {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    padding: 0.5rem 0;
  }
  
  /* 日历表格 */
  .mood-calendar .mood-calendar-body {
    padding: 0.5rem;
  }
  
  .mood-calendar .mood-calendar-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0.5rem;
  }
  
  .mood-calendar .mood-calendar-date {
    padding: 0;
    width: 14.28571429%;
  }
  
  /* 修复日历单元格的显示问题 */
  .mood-calendar .mood-calendar-date-cell {
    padding: 0;
    height: auto !important;
    min-height: 50px;
  }
  
  /* 修复月份选择器的下拉列表样式 */
  .mood-calendar .mood-calendar-month-panel,
  .mood-calendar .mood-calendar-year-panel {
    background-color: white;
    color: black;
  }
  
  /* 确保日历面板正常显示 */
  .mood-calendar .mood-calendar-panel {
    background-color: white;
    border-radius: 0 0 0.5rem 0.5rem;
  }
  
  /* 修复月份和年份面板的样式 */
  .mood-calendar .mood-calendar-month-panel ul,
  .mood-calendar .mood-calendar-year-panel ul {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
  }
  
  .mood-calendar .mood-calendar-month-panel li,
  .mood-calendar .mood-calendar-year-panel li {
    list-style: none;
    flex: 0 0 33.333%;
    text-align: center;
    padding: 8px;
    cursor: pointer;
  }
  
  .mood-calendar .mood-calendar-month-panel li:hover,
  .mood-calendar .mood-calendar-year-panel li:hover {
    background-color: #f0f0f0;
  }
  
  /* 移除不需要的元素 */
  .mood-calendar .mood-calendar-time {
    display: none;
  }
  
  /* 修复月份和年份选择器的下拉箭头 */
  .mood-calendar .mood-calendar-month-select:after,
  .mood-calendar .mood-calendar-year-select:after {
    content: '▼';
    font-size: 0.75rem;
    margin-left: 4px;
    opacity: 0.7;
  }
  
  /* 修复月份和年份面板的标题 */
  .mood-calendar .mood-calendar-month-panel-header,
  .mood-calendar .mood-calendar-year-panel-header {
    background-color: #1f2937;
    color: white;
    padding: 8px;
    text-align: center;
  }
  
  /* 修复月份和年份面板的按钮 */
  .mood-calendar .mood-calendar-month-panel-prev,
  .mood-calendar .mood-calendar-month-panel-next,
  .mood-calendar .mood-calendar-year-panel-prev,
  .mood-calendar .mood-calendar-year-panel-next {
    color: white;
    background: none;
    border: none;
    font-size: 1.25rem;
    padding: 4px 8px;
    cursor: pointer;
  }
  
  /* 确保日历主体部分正常显示 */
  .mood-calendar .mood-calendar-content {
    background-color: white;
    border-radius: 0 0 0.5rem 0.5rem;
  }
  
  /* 修复日历表格行高 */
  .mood-calendar .mood-calendar-table tr {
    height: 50px;
  }
  
  /* 修复今天日期的样式 */
  .mood-calendar .mood-calendar-today {
    background-color: transparent;
  }
`;

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

  // 获取某天的心情记录
  const getMoodForDate = (date: string): MoodRecordType | null => {
    const record = moodRecords.find(record => record.date === date);
    return record || null;
  };

  // 处理日期选择
  const handleDateSelect = (value: Moment | null) => {
    console.log('handleDateSelect', value);
    if (!value) return;
    const dateStr = value.format('YYYY-MM-DD');
    console.log('dateStr',dateStr);
    setSelectedDate(dateStr);
    setShowMoodPicker(!showMoodPicker || selectedDate !== dateStr);
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

  // 切换月份
  const handleMonthChange = (value: Moment | null) => {
    console.log('handleMonthChange', value);
    if (!value) return;
    setCurrentDate(value);
    setShowMoodPicker(false);
  };

  // 自定义日期单元格渲染
  const dateCellRender = (value: Moment) => {
    const dateStr = value.format('YYYY-MM-DD');
    const mood = getMoodForDate(dateStr);
    const isSelected = selectedDate === dateStr;
    const isCurrentMonth = value.isSame(currentDate, 'month');
    
    return (
      <div className='w-[60px] h-[60px]'>
        <div
          className={`
            w-full h-full aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200
            ${isCurrentMonth ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-400 cursor-default'}
            ${isSelected ? 'ring-2 ring-yellow-400 scale-105' : ''}
          `}
        >
          <div className="text-sm">{value.date()}</div>
          {mood && (
            <div className="text-2xl mt-1">{mood.emoji}</div>
          )}
          {/* 显示红点标记 */}
          {isCurrentMonth && !mood && (
            <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[540px] mx-auto p-4">
      <style>{customStyles}</style>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">心情记录日历</h2>
        <p className="text-gray-500">点击日期选择心情</p>
      </div>
      
      {/* 使用rc-calendar组件 */}
      <div className="rc-calendar-container">
        <Calendar
          value={currentDate}
          onChange={handleDateSelect}
          onPanelChange={handleMonthChange}
          dateRender={dateCellRender}
          mode="month"
          prefixCls="mood-calendar"
          className="bg-white rounded-lg shadow-lg"
          showDateInput={false}
        />
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