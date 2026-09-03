import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, Form } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartFormEditMode } from '@/components/common'
import { Backend } from '@repo/types'
import { valueSetSearchGroupSchema, getValueSetGroupColumns } from '../model'
import { useValueSetList, fetchSetValueIds } from '../hooks/useValueSetList'
import { useValueSetExcel } from '../hooks/useValueSetExcel'
import { useDrawer } from '@/hooks/useDrawer'
import { ValueSetFormContainer } from '../components/ValueSetFormContainer'
import valueSetApi from '../api/value-set'

const formTitleMap = { create: '新增值集', edit: '编辑值集', view: '值集详情' }

export function ValueSetListPage() {
  const {
    searchParams,
    smartTable,
    handleFetchData,
    searchTable,
    refreshTable,
    onDelete,
    onBatchDelete,
  } = useValueSetList()

  // 集列表不限定单集,不传 setCode:导出按集列表筛选(setCode/setCode、setName)透传,导入成功后刷新集列表
  const excel = useValueSetExcel(searchParams, undefined, refreshTable)

  const {
    drawerVisible,
    formMode,
    openDrawer,
    closeDrawer,
    drawerData: currentId,
  } = useDrawer<number>()

  const navigate = useNavigate()
  const [form] = Form.useForm()

  const columns = useMemo(
    () =>
      getValueSetGroupColumns({
        onViewDetail(record: Backend.ValueSetGroupPageRespDto) {
          navigate(`/value-set/detail/${record.setCode}`)
        },
        async onStatusChange(record: Backend.ValueSetGroupPageRespDto, newStatus: number) {
          // 集为虚拟聚合，切换状态时更新该集下所有值
          const ids = await fetchSetValueIds(record.setCode)
          if (!ids.length) return Promise.reject(new Error('无值可更新'))
          return valueSetApi.batchUpdateStatus(ids.join(), newStatus)
        },
        refreshList() {
          refreshTable()
        },
      }),
    [navigate, refreshTable],
  )

  const onCreate = () => {
    openDrawer('create')
  }

  const onEdit = async (record: Backend.ValueSetGroupPageRespDto) => {
    // 集为虚拟聚合，编辑时取该集下第一条值进行编辑
    const res = await valueSetApi.page({ setCode: record.setCode, page: 1, pageSize: 1 })
    const first = res.data?.list?.[0]
    if (first) {
      openDrawer('edit', first.id)
    } else {
      openDrawer('create')
    }
  }

  return (
    <PageLayout>
      <SmartForm
        form={form}
        schema={valueSetSearchGroupSchema}
        layout="inline"
        onFinish={searchTable}
        style={{ marginBottom: 16 }}
      ></SmartForm>

      <SmartTable<Backend.ValueSetGroupPageRespDto>
        ref={smartTable}
        rowKey="setCode"
        searchParams={searchParams}
        schema={valueSetSearchGroupSchema}
        request={handleFetchData}
        columns={columns}
        rowSelection={{}}
        excel={excel}
        toolbar={{
          onCreate,
          onBatchDelete,
        }}
        actionColumn={{
          buttons: () => ['edit', 'delete'],
          onEdit,
          onDelete,
        }}
        scroll={{ x: 'max-content' }}
      />

      <Drawer
        title={formTitleMap[formMode as SmartFormEditMode]}
        open={drawerVisible}
        onClose={() => closeDrawer()}
        size={'large'}
        destroyOnHidden
      >
        <ValueSetFormContainer
          id={currentId as number}
          mode={formMode as SmartFormEditMode}
          editTarget="set"
          closeDrawer={closeDrawer}
          onSuccess={() => {
            closeDrawer()
            refreshTable()
          }}
        />
      </Drawer>
    </PageLayout>
  )
}
