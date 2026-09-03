import { useCallback, useMemo, useState } from 'react'
import { Drawer, Form } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import {
  SmartTable,
  SmartForm,
  SmartFormEditMode,
  CustomAction,
  DragOrderChangeInfo,
} from '@/components/common'
import { ResourceFormContainer } from '../components/ResourceFormContainer'
import { resourceSearchSchema, getResourceColumns } from '../model'
import { useDrawer } from '@/hooks/useDrawer'
import { useResourceList } from '../hooks/useResourceList'
import { useResourceExcel } from '../hooks/useResourceExcel'
import userApi from '../api/resource'
import { SUCCESS_MESSAGE, ERROR_MESSAGE, CONFIRM_MESSAGE } from '@/constants'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  PlusOutlined,
  PlusSquareOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'
import {
  getParentNode,
  getModal,
  getMessage,
  getPrevNode,
  getNextNode,
  getPrevNodes,
  getNextNodes,
} from '@/utils'
import { ResourcePageRespDto } from '../types'
import resourceApi from '../api/resource'

const formTitleMap = {
  createLast: '新增资源',
  edit: '编辑资源',
  view: '资源详情',
  createSub: '新增子资源',
  createPrev: '在上方插入资源',
  copyPrev: '复制到上方',
}
export function ResourceListPage() {
  const {
    resourceTree,
    resourceParentMap,
    searchParams,
    smartTable,
    handleFetchData,
    searchTable,
    refreshTable,
    onDelete,
    onBatchDelete,
  } = useResourceList()

  const { drawerVisible, formMode, openDrawer, closeDrawer, drawerData } =
    useDrawer<ResourcePageRespDto>()

  const excel = useResourceExcel(searchParams, refreshTable)

  const [formType, setFormType] = useState('')

  const [sameLevelList, setSameLevelList] = useState<ResourcePageRespDto[]>([])

  const [form] = Form.useForm()

  const handleOpenDrawer = useCallback(
    (mode: SmartFormEditMode, record?: ResourcePageRespDto) => {
      openDrawer(mode, record)
    },
    [openDrawer],
  )

  const onEdit = useCallback(
    (record: ResourcePageRespDto) => {
      setFormType('edit')
      handleOpenDrawer('edit', record)
    },
    [handleOpenDrawer],
  )

  const columns = useMemo(
    () =>
      getResourceColumns({
        onStatusChange(record: ResourcePageRespDto, newStatus: string) {
          return updateResourceStatus(record.id!, newStatus)
        },
        handleDeleteMeta(record) {
          // console.log('handleDeleteMeta', record)
          getModal().confirm({
            title: '提示',
            content: CONFIRM_MESSAGE.DELETE,
            okText: '确认',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
              onDelete(record as ResourcePageRespDto)
            },
          })
        },
        handleEditMeta(record) {
          onEdit(record as ResourcePageRespDto)
          // console.log('handleEditMeta', record)
        },
        async refreshList() {
          await refreshTable()
        },
      }),
    [refreshTable, onEdit, onDelete],
  )

  async function updateResourceStatus(id: number, newStatus: string) {
    return userApi.updateStatus(id, newStatus)
  }

  const onCreate = () => {
    setFormType('createLast')
    setSameLevelList(resourceTree)
    handleOpenDrawer('create')
  }

  const createSubButton: CustomAction<ResourcePageRespDto> = {
    key: 'createSub',
    label: '',
    icon: <PlusSquareOutlined />,
    title: '创建子资源',
    onClick(record) {
      setFormType('createSub')
      setSameLevelList(record.children!)
      openDrawer('create', record)
    },
  }
  const createPrevButton: CustomAction<ResourcePageRespDto> = {
    key: 'createPrev',
    label: '',
    icon: <PlusOutlined />,
    title: '在上方插入资源',
    onClick(record) {
      setFormType('createPrev')
      const parentNode = getParentNode(resourceTree, record.uniqueProp!, { idKey: 'uniqueProp' })
      setSameLevelList(parentNode ? parentNode.children! : resourceTree)
      // 获取位置信息
      openDrawer('create', record)
    },
  }
  const copyPrevButton: CustomAction<ResourcePageRespDto> = {
    key: 'copyPrev',
    label: '',
    icon: <CopyOutlined />,
    title: '复制到上方',
    onClick(record) {
      setFormType('copyPrev')
      const parentNode = getParentNode(resourceTree, record.uniqueProp!, { idKey: 'uniqueProp' })
      setSameLevelList(parentNode ? parentNode.children! : resourceTree)
      // 获取位置信息
      openDrawer('create', record)
    },
  }
  const moveUpButton = (record: ResourcePageRespDto): CustomAction<ResourcePageRespDto> => ({
    key: 'moveUp',
    label: '',
    icon: <ArrowUpOutlined />,
    title: '上移',
    disabled: record._isFirst,
    async onClick(record) {
      if (record._isFirst) {
        return
      }
      const prevNode = getPrevNode(record, resourceParentMap, resourceTree, { idKey: 'uniqueProp' })
      if (!prevNode) {
        return
      }
      await resourceApi.batchUpdate({
        list: [
          {
            id: record.id,
            sortNumber: prevNode.sortNumber,
          },
          {
            id: prevNode.id,
            sortNumber: record.sortNumber,
          },
        ],
      })
      refreshTable()
      getMessage().success(SUCCESS_MESSAGE.SORT_DONE)
    },
  })
  const moveDownButton = (record: ResourcePageRespDto): CustomAction<ResourcePageRespDto> => ({
    key: 'moveDown',
    label: '',
    icon: <ArrowDownOutlined />,
    title: '下移',
    disabled: record._isLast,
    async onClick(record) {
      if (record._isLast) {
        return
      }
      const nextNode = getNextNode(record, resourceParentMap, resourceTree, { idKey: 'uniqueProp' })
      if (!nextNode) {
        return
      }
      await resourceApi.batchUpdate({
        list: [
          {
            id: record.id,
            sortNumber: nextNode.sortNumber,
          },
          {
            id: nextNode.id,
            sortNumber: record.sortNumber,
          },
        ],
      })
      refreshTable()
      getMessage().success(SUCCESS_MESSAGE.SORT_DONE)
    },
  })
  const moveToTopButton = (record: ResourcePageRespDto): CustomAction<ResourcePageRespDto> => ({
    key: 'moveToTop',
    label: '',
    icon: <VerticalAlignTopOutlined />,
    title: '置顶',
    disabled: record._isFirst,
    async onClick(record) {
      if (record._isFirst) {
        return
      }
      const info = getPrevNodes(record, resourceParentMap, resourceTree, { idKey: 'uniqueProp' })
      if (!info) {
        return
      }
      await resourceApi.batchUpdate({
        list: [
          {
            id: record.id,
            sortNumber: info.firstNode.sortNumber,
          },
          ...info.prevNodes.map((item) => ({
            id: item.id,
            sortNumber: item.sortNumber! + 1,
          })),
        ],
      })
      refreshTable()
      getMessage().success(SUCCESS_MESSAGE.SORT_DONE)
    },
  })
  const moveToBottomButton = (record: ResourcePageRespDto): CustomAction<ResourcePageRespDto> => ({
    key: 'moveToBottom',
    label: '',
    icon: <VerticalAlignBottomOutlined />,
    title: '置底',
    disabled: record._isLast,
    async onClick(record) {
      if (record._isLast) {
        return
      }
      const info = getNextNodes(record, resourceParentMap, resourceTree, { idKey: 'uniqueProp' })
      if (!info) {
        return
      }
      await resourceApi.batchUpdate({
        list: [
          {
            id: record.id,
            sortNumber: info.lastNode.sortNumber,
          },
          ...info.nextNodes.map((item) => ({
            id: item.id,
            sortNumber: item.sortNumber! - 1,
          })),
        ],
      })
      refreshTable()
      getMessage().success(SUCCESS_MESSAGE.SORT_DONE)
    },
  })

  const handleOrderChange = async (
    newDataSource: ResourcePageRespDto[],
    info?: DragOrderChangeInfo,
  ) => {
    const paramsList = info?.parentItem ? info?.parentChildren : newDataSource
    try {
      await resourceApi.batchUpdate({
        list: (paramsList as ResourcePageRespDto[]).map((item, index) => ({
          id: item.id,
          sortNumber: index + 1,
        })),
      })
      // 注意，这里是拖拽排序，一般来讲是乐观更新，成功后不需要重新请求最新列表
      getMessage().success(SUCCESS_MESSAGE.SORT_DONE)
    } catch (e) {
      refreshTable()
      getMessage().error(ERROR_MESSAGE.SORT_FAILED)
      console.error('排序失败', e)
    }
  }

  return (
    <PageLayout>
      <SmartForm
        form={form}
        schema={resourceSearchSchema}
        layout="inline"
        onFinish={searchTable}
        style={{ marginBottom: 16 }}
      ></SmartForm>

      <SmartTable<ResourcePageRespDto>
        ref={smartTable}
        isDragSortable={true}
        searchParams={searchParams}
        schema={resourceSearchSchema}
        request={handleFetchData}
        columns={columns}
        rowSelection={{}}
        handleOrderChange={handleOrderChange}
        treeConfig={{ idKey: 'uniqueProp', parentKey: 'parentUniqueProp' }}
        excel={excel}
        toolbar={{
          onCreate,
          onBatchDelete,
          additionalActions: [
            {
              key: 'resetSort',
              label: '重置顺序',
              danger: true,
              onClick() {
                getModal().confirm({
                  title: '提示',
                  content: CONFIRM_MESSAGE.RESET_SORT,
                  okText: '确认',
                  cancelText: '取消',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    await resourceApi.resetSort()
                    refreshTable()
                    getMessage().success(SUCCESS_MESSAGE.OPERATION)
                  },
                })
              },
            },
          ],
        }}
        actionColumn={{
          onlyIcon: true,
          buttons: (record) => [
            createSubButton,
            copyPrevButton,
            createPrevButton,
            moveUpButton(record),
            moveDownButton(record),
            moveToTopButton(record),
            moveToBottomButton(record),
            'edit',
            'delete',
          ],
          maxVisible: 2,
          onEdit,
          onDelete,
        }}
        scroll={{ x: 'max-content' }}
        showPagination={false}
      />

      <Drawer
        title={formTitleMap[formType as keyof typeof formTitleMap]}
        open={drawerVisible}
        onClose={() => closeDrawer()}
        size={'large'}
        destroyOnHidden
      >
        <ResourceFormContainer
          drawerData={drawerData as ResourcePageRespDto}
          mode={formMode}
          closeDrawer={closeDrawer}
          formType={formType}
          sameLevelList={sameLevelList}
          onSuccess={() => {
            closeDrawer()
            refreshTable()
          }}
        />
      </Drawer>
    </PageLayout>
  )
}
