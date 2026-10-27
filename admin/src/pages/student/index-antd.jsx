import React, { useState, useEffect } from 'react';
import Table from 'components/Table';
import { AuthService } from 'services';

const DataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10000,
    total: 0
  });

  const fetchData = async (pageParams = {}) => {
    setLoading(true);
    try {
      const response = await AuthService.axiosPrivatePost('studentsList', {
        current: pageParams.current || pagination.current,
        pageSize: pageParams.pageSize || pagination.pageSize
      });

      setData(response.data.data);
      setPagination({
        ...pagination,
        current: response.data.current,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pagination) => {
    fetchData({
      current: pagination.current,
      pageSize: pagination.pageSize
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'student_id',
      key: 'student_id'
    },
    {
      title: 'Date Added',
      dataIndex: 'datetime',
      key: 'datetime',
      sorter: (a, b) => a.datetime?.localeCompare(b?.datetime)
    },
    {
      title: 'Family Name',
      dataIndex: 'family_name',
      key: 'family_name'
    },
    {
      title: 'First Name',
      dataIndex: 'fname',
      key: 'fname'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'CRN',
      dataIndex: 'crn',
      key: 'crn'
    },
    {
      title: 'Institution Name',
      dataIndex: 'institution_name',
      key: 'institution_name'
    },
    {
      title: 'Date Started',
      dataIndex: 'year_started',
      key: 'year_started'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: 'Town/City',
      dataIndex: 'city',
      key: 'city'
    }
  ];

  return <Table columns={columns} dataList={data} loading={loading} name="Studenttbl" />;
};

export default DataTable;
