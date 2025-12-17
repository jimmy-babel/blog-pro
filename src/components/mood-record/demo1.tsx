// react-big-calendar 日历组件
import React, { useState } from 'react'
import OriPop from "@/components/ori-cmpts/ori-pop/OriPop"
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type Props = {}

// 设置本地化器
const localizer = momentLocalizer(moment);

// 示例心情记录事件数据
const sampleEvents: Event[] = [
  {
    // id: 1,
    title: '开心',
    start: new Date(2024, 4, 15, 10, 0),
    end: new Date(2024, 4, 15, 11, 0),
    allDay: true,
  },
  {
    // id: 2,
    title: '平静',
    start: new Date(2024, 4, 16, 10, 0),
    end: new Date(2024, 4, 16, 11, 0),
    allDay: true,
  },
  {
    // id: 3,
    title: '兴奋',
    start: new Date(2024, 4, 17, 10, 0),
    end: new Date(2024, 4, 17, 11, 0),
    allDay: true,
  },
  {
    // id: 4,
    title: '低落',
    start: new Date(2024, 4, 18, 10, 0),
    end: new Date(2024, 4, 18, 11, 0),
    allDay: true,
  },
];

const MoodRecord = (props: Props) => {
  const [visible, setVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  
  const onClose = () => {
    console.log('onCloseonClose', visible);
    setVisible(false);
  };

  // 处理事件选择
  const handleSelectEvent = (event: Event) => {
    alert(`选择了心情: ${event.title}\n日期: ${moment(event.start).format('YYYY-MM-DD')}`);
  };

  // 处理日期选择
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('请输入今天的心情:');
    if (title) {
      setEvents([
        ...events,
        {
          // id: events.length + 1,
          title,
          start,
          end,
          allDay: true,
        },
      ]);
    }
  };

  return (
    <>
      <div onClick={() => setVisible(true)} className="cursor-pointer hover:text-blue-600 transition-colors">
        <div>MoodRecord</div>
        <div className="text-sm text-gray-500">点击查看日历</div>
        <div className="p-4 w-[800px] h-[600px]">
          <div className='flex justify-between items-center mb-4'>
            <div className='text-2xl font-bold'>心情记录日历</div>
          </div>
          <div className="h-[500px] bg-white rounded-lg shadow-md">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              allDayAccessor="allDay"
              style={{ height: '100%' }}
              views={['month', 'week', 'day']}
              defaultView="month"
            />
          </div>
        </div>
      </div>
      {/* <OriPop
        visible={visible}
        onVisibleChange={setVisible}
        onClose={onClose}
        placement="center"
        children={
          <div>测试</div>
        }
        customPopupStyle={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          padding: '0'
        }}
        ></OriPop> */}
    </>
  )
}

export default MoodRecord;