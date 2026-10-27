import React, { useState, useEffect } from 'react';
import { useVT } from 'virtualizedtableforantd4';
import TableWithLoader from 'antd-table-loader';

const Table = (props) => {
  const { columns, dataList, loading, name } = props;

  const size = 'large';
  const top = 'topLeft';
  const bottom = 'bottomRight';
  const ellipsis = false;
  const yScroll = props?.scroll !== 'none' ? 'fixed' : '';
  const xScroll = props?.scroll !== 'none' ? 'fixed' : '';

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const updateDimensions = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };
  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const scroll = {};
  if (yScroll) {
    if (height <= 900) {
      scroll.y = 500;
    } else {
      scroll.y = 550;
    }
  }
  if (xScroll) {
    if (width <= '1440') {
      scroll.x = '180vw';
    } else {
      scroll.x = '110vw';
    }
  }

  const tableColumns = columns.map((item) => ({ ...item, ellipsis }));
  if (xScroll === 'fixed') {
    tableColumns[0].fixed = true;
    tableColumns[tableColumns.length - 1].fixed = 'right';
  }

  const tableProps = {
    bordered: true,
    size,
    showHeader: true,
    scroll,
    className: name
  };

  const [vt, set_components] = useVT(() => ({ scroll: { y: 600 } }), []);

  return (
    <TableWithLoader
      columns={tableColumns}
      dataSource={dataList}
      {...tableProps}
      pagination={{
        position: [top, bottom],
        defaultPageSize: 1000,
        pageSizeOptions: [250, 500, 1000, 2000],
        showTotal: (total, range) => {
          return `Total ${total} items`;
        },
        className: 'pagin'
      }}
      scroll={scroll}
      components={vt}
      rowKey={(record) => (record._id ? record._id : record.id)}
      loading={loading}
    />
  );
};

export default Table;
