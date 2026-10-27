import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import rrulePlugin from '@fullcalendar/rrule';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, List, Typography, Spin, Button, DatePicker } from 'antd';
import { AuthService } from 'services';
import dayjs from 'dayjs';

const { Text } = Typography;

const StudentCalendar = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await AuthService.axiosPrivatePost('studentsCalendar');
      const data = response.data.data || {};

      // Convert student data into FullCalendar event format
      const formattedEvents = [];
      Object.entries(data).forEach(([date, students]) => {
        if (date == '2025-04-02') {
          students.forEach((student, index) => {
            formattedEvents.push({
              title: student.student_name + ' Birthday',
              rrule: {
                freq: 'yearly',
                dtstart: `${date}T00:00:00` // ISO format
              },
              allDay: true,
              extendedProps: { student },
              display: 'block'
            });
          });
        } else {
          students.forEach((student, index) => {
            formattedEvents.push({
              title: student.student_name,
              date,
              extendedProps: { student },
              display: 'block'
            });
          });
        }
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEventClick = (info) => {
    const { student, fullList } = info.event.extendedProps;
    setSelectedStudents(fullList || [student]);
    setSelectedDate(info.event.startStr);
    setModalVisible(true);
  };

  return (
    <>
      <DatePicker
        picker="month"
        onChange={(date) => {
          if (date && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(date.format('YYYY-MM-DD'));
          }
        }}
        style={{ marginBottom: 16 }}
      />
      <Spin spinning={loading}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, rrulePlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          eventDisplay="block"
          dayMaxEvents={true}
          eventContent={(arg) => <div style={{ fontSize: '12px', padding: '2px' }}>{arg.event.title}</div>}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridDay'
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            day: 'Day'
          }}
          dateClick={(info) => {
            const calendarApi = info.view.calendar;
            calendarApi.changeView('dayGridDay', info.dateStr);
          }}
        />
      </Spin>

      <Modal
        title={(selectedStudents.length == 1 ? 'Student' : 'Students') + ` Registered on ${dayjs(selectedDate).format('MMMM D, YYYY')}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <List
          dataSource={selectedStudents}
          renderItem={(student) => (
            <List.Item key={student.id}>
              <List.Item.Meta
                title={<Text strong>{student.student_name}</Text>}
                description={
                  <>
                    <Text type="secondary">Email: {student.email}</Text>
                    <br />
                    <Text type="secondary">Registered: {dayjs(student.datetime).format('MMMM D, YYYY h:mm A')}</Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default StudentCalendar;
