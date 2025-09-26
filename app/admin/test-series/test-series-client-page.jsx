'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'react-hot-toast'
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  List,
  PlusCircle,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import ConfirmModal from '@/components/ui/confirm-modal'
import { format } from 'date-fns'

export default function AdminTestSeriesClientPage() {
  const [testSeries, setTestSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isManageTestsModalOpen, setIsManageTestsModalOpen] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [seriesToDelete, setSeriesToDelete] = useState(null)
  const [allTests, setAllTests] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DAILY',
    isPublished: false,
  })

  useEffect(() => {
    fetchTestSeries()
    fetchAllTests()
  }, [])

  const fetchTestSeries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/test-series')
      if (response.ok) {
        const data = await response.json()
        // Sort test series: DAILY first, then PLAYLIST
        const sortedData = data.sort((a, b) => {
          if (a.type === 'DAILY' && b.type === 'PLAYLIST') return -1
          if (a.type === 'PLAYLIST' && b.type === 'DAILY') return 1
          return 0
        })
        setTestSeries(sortedData)
      } else {
        toast.error('Failed to fetch test series.')
      }
    } catch (error) {
      toast.error('An error occurred while fetching test series.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTests = async () => {
    // This API endpoint does not exist yet. Assuming it will get all tests.
    // Replace with the correct endpoint if it exists, or create one.
    try {
      const response = await fetch('/api/tests') // Placeholder
      if (response.ok) {
        const data = await response.json()
        setAllTests(data.tests)
      }
    } catch (error) {
      console.error('Error fetching all tests:', error)
    }
  }

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault()
    const url = selectedSeries
      ? `/api/admin/test-series/${selectedSeries.id}`
      : '/api/admin/test-series'
    const method = selectedSeries ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(
          `Test series ${selectedSeries ? 'updated' : 'created'} successfully.`
        )
        fetchTestSeries()
        closeModal()
      } else {
        toast.error('An error occurred.')
      }
    } catch (error) {
      toast.error('An error occurred.')
    }
  }

  const handleDelete = async () => {
    if (!seriesToDelete) return

    try {
      const response = await await fetch(
        `/api/admin/test-series/${seriesToDelete.id}`,
        {
          method: 'DELETE',
        }
      )
      if (response.ok) {
        toast.success('Test series deleted successfully.')
        fetchTestSeries()
      } else {
        toast.error('Failed to delete test series.')
      }
    } catch (error) {
      toast.error('An error occurred while deleting.')
    } finally {
      closeConfirmModal()
    }
  }

  const handleAddTest = async (testId) => {
    if (!selectedSeries) return
    try {
      const response = await fetch(
        `/api/admin/test-series/${selectedSeries.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId }),
        }
      )
      if (response.ok) {
        toast.success('Test added to series.')
        fetchSeriesDetails(selectedSeries.id) // Refreshes the tests in the modal
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add test.')
      }
    } catch (error) {
      toast.error('An error occurred.')
    }
  }

  const handleRemoveTest = async (testId) => {
    if (!selectedSeries) return

    try {
      const response = await fetch(
        `/api/admin/test-series/${selectedSeries.id}/tests/${testId}`,
        {
          method: 'DELETE',
        }
      )
      if (response.ok) {
        toast.success('Test removed from series.')
        fetchSeriesDetails(selectedSeries.id)
      } else {
        toast.error('Failed to remove test.')
      }
    } catch (error) {
      toast.error('An error occurred.')
    }
  }

  const fetchSeriesDetails = async (seriesId) => {
    try {
      const response = await fetch(`/api/admin/test-series/${seriesId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedSeries(data)
      } else {
        toast.error('Failed to fetch series details.')
      }
    } catch (error) {
      toast.error('An error occurred.')
    }
  }

  const openModal = (series = null) => {
    setSelectedSeries(series)
    if (series) {
      setFormData({
        title: series.title,
        description: series.description,
        type: series.type,
        isPublished: series.isPublished,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'DAILY',
        isPublished: false,
      })
    }
    setIsModalOpen(true)
  }
  const closeModal = () => setIsModalOpen(false)

  const openConfirmModal = (series) => {
    setSeriesToDelete(series)
    setIsConfirmModalOpen(true)
  }
  const closeConfirmModal = () => {
    setSeriesToDelete(null)
    setIsConfirmModalOpen(false)
  }

  const openManageTestsModal = (series) => {
    setSelectedSeries(series)
    setIsManageTestsModalOpen(true)
  }
  const closeManageTestsModal = () => {
    setSelectedSeries(null)
    setIsManageTestsModalOpen(false)
    fetchTestSeries() // Refresh list on close
  }

  return (
    <div className="">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => openModal()}
          className="dark:bg-slate-800 dark:text-white hover:bg-slate-800 hover:text-white dark:border-slate-700 border-slate-200 dark:hover:bg-slate-700 dark:hover:text-white bg-slate-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Test Series
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testSeries.map((series) => (
            <Card
              key={series.id}
              className="dark:bg-slate-800 dark:text-white bg-slate-100 "
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {series.title}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="dark:bg-slate-800 dark:text-white bg-white"
                  >
                    <DropdownMenuItem
                      onClick={() => openModal(series)}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => openManageTestsModal(series)}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <List className="mr-2 h-4 w-4" />
                      Manage Tests
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => openConfirmModal(series)}
                      className="cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {series.description}
                </div>
                <div className="flex items-center space-x-4 text-sm mt-4">
                  <Badge variant={series.isPublished ? 'success' : 'secondary'}>
                    {series.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant="outline">{series.type}</Badge>
                  <span>{series._count?.tests || 0} tests</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Created: {format(new Date(series.createdAt), 'PPP')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="dark:bg-slate-800 dark:text-white bg-white">
          <DialogHeader>
            <DialogTitle>
              {selectedSeries ? 'Edit Test Series' : 'Create Test Series'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the test series.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3 dark:bg-slate-800 dark:text-white bg-white cursor-pointer">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:text-white bg-white cursor-pointer">
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="PLAYLIST">Playlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="published" className="text-right">
                  Published
                </Label>
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title="Delete Test Series"
        description="Are you sure you want to delete this test series? This action cannot be undone."
      />

      {/* Manage Tests Modal */}
      <Dialog
        open={isManageTestsModalOpen}
        onOpenChange={setIsManageTestsModalOpen}
      >
        <DialogContent className="max-w-2xl dark:bg-slate-800 dark:text-white bg-white">
          <DialogHeader>
            <DialogTitle>Manage Tests in {selectedSeries?.title}</DialogTitle>
            <DialogDescription>
              Add or remove tests from this series.
            </DialogDescription>
          </DialogHeader>
          <div>
            <h3 className="font-semibold mb-2">Tests in Series</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedSeries?.tests?.map(({ test }) => (
                <div
                  key={test.id}
                  className="flex justify-between items-center p-2 border rounded-md"
                >
                  <p>{test.title}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTest(test.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {selectedSeries?.tests?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tests in this series.
                </p>
              )}
            </div>

            <h3 className="font-semibold my-4">Add Tests</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allTests
                .filter(
                  (test) =>
                    !selectedSeries?.tests.some((t) => t.test.id === test.id)
                )
                .map((test) => (
                  <div
                    key={test.id}
                    className="flex justify-between items-center p-2 border rounded-md"
                  >
                    <p>{test.title}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddTest(test.id)}
                    >
                      <PlusCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
