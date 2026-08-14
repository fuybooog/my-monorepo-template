import { useMemo, useState } from 'react'
import { Drawer, Form } from 'antd'
import { PageLayout } from '@/components/PageLayout'
import { SmartTable, SmartForm, SmartFormEditMode, CustomAction } from '@/components/common'
import { ResourceFormContainer } from '../components/ResourceFormContainer'
import { resourceSearchSchema, getResourceColumns } from '../model'
import { useDrawer } from '@/hooks/useDrawer'
import { useResourceList } from '../hooks/useResourceList'
import userApi from '../api/resource'
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

  const [formType, setFormType] = useState('')

  const [sameLevelList, setSameLevelList] = useState<ResourcePageRespDto[]>([])

  const [form] = Form.useForm()

  const columns = useMemo(
    () =>
      getResourceColumns({
        onStatusChange(record: ResourcePageRespDto, newStatus: string) {
          return updateResourceStatus(record.id!, newStatus)
        },
        handleDeleteMeta(record) {
          console.log('handleDeleteMeta', record)
        },
        handleEditMeta(record) {
          console.log('handleEditMeta', record)
        },
        async refreshList() {
          await refreshTable()
        },
      }),
    [refreshTable],
  )

  async function updateResourceStatus(id: number, newStatus: string) {
    return userApi.updateStatus(id, newStatus)
  }

  const onCreate = () => {
    setFormType('createLast')
    setSameLevelList(resourceTree)
    handleOpenDrawer('create')
  }
  const onEdit = (record: ResourcePageRespDto) => {
    setFormType('edit')
    handleOpenDrawer('edit', record)
  }

  const handleOpenDrawer = (mode: SmartFormEditMode, record?: ResourcePageRespDto) => {
    openDrawer(mode, record)
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
      getMessage().success('排序完成')
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
      getMessage().success('排序完成')
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
      getMessage().success('排序完成')
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
      getMessage().success('排序完成')
    },
  })

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
        searchParams={searchParams}
        schema={resourceSearchSchema}
        request={handleFetchData}
        columns={columns}
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
                  content: '确定要重置顺序吗？',
                  okText: '确认',
                  cancelText: '取消',
                  okButtonProps: { danger: true },
                  onOk: async () => {
                    await resourceApi.resetSort()
                    refreshTable()
                    getMessage().success('操作成功')
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
