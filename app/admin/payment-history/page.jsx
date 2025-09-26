'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Zap,
  Crown,
  Star,
  Sparkles,
} from 'lucide-react'

export default function AdminPaymentHistory() {
  const [plans, setPlans] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [deletingPlan, setDeletingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    durationType: 'days',
    untilDate: '',
    description: '',
    discount: '',
    isActive: true,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/payment-plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Please enter a plan name')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price')
      return
    }

    if (formData.durationType === 'until_date') {
      if (!formData.untilDate) {
        alert('Please select an end date for this plan')
        return
      }
    } else {
      if (!formData.duration || parseInt(formData.duration) <= 0) {
        alert('Please enter a valid duration')
        return
      }
    }

    try {
      const url = editingPlan
        ? `/api/admin/payment-plans/${editingPlan.id}`
        : '/api/admin/payment-plans'
      const method = editingPlan ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingPlan(null)
        resetForm()
        fetchPlans()
        alert(
          editingPlan
            ? 'Plan updated successfully!'
            : 'Plan created successfully!'
        )
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to save plan'}`)
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('An error occurred while saving the plan')
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      durationType: plan.durationType || 'days',
      untilDate: plan.untilDate || '',
      description: plan.description || '',
      discount: plan.discount?.toString() || '',
      isActive: plan.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (plan) => {
    setDeletingPlan(plan)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingPlan) return

    try {
      const response = await fetch(
        `/api/admin/payment-plans/${deletingPlan.id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        const result = await response.json()
        setIsDeleteDialogOpen(false)
        setDeletingPlan(null)
        fetchPlans()

        // Show success message with warning if applicable
        if (result.warning) {
          alert(`Plan deactivated successfully!\n\nWarning: ${result.warning}`)
        } else {
          alert('Plan deactivated successfully!')
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to delete plan'}`)
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('An error occurred while deleting the plan')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      durationType: 'days',
      untilDate: '',
      description: '',
      discount: '',
      isActive: true,
    })
  }

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price) || 0
    const discount = parseFloat(formData.discount) || 0
    if (discount > 0) {
      return price - (price * discount) / 100
    }
    return price
  }

  const formatDuration = (plan) => {
    if (plan.durationType === 'until_date' && plan.untilDate) {
      return `Until ${new Date(plan.untilDate).toLocaleDateString()}`
    }
    return `${plan.duration} ${plan.durationType}`
  }

  const getPlanIcon = (plan) => {
    if (plan.name.toLowerCase().includes('premium')) return Crown
    if (plan.name.toLowerCase().includes('basic')) return Star
    if (plan.name.toLowerCase().includes('pro')) return Zap
    return TrendingUp
  }

  const getPlanColor = (plan) => {
    if (plan.name.toLowerCase().includes('premium'))
      return 'from-purple-500 to-pink-500'
    if (plan.name.toLowerCase().includes('basic'))
      return 'from-blue-500 to-cyan-500'
    if (plan.name.toLowerCase().includes('pro'))
      return 'from-orange-500 to-red-500'
    return 'from-green-500 to-emerald-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Payment Plans
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Manage subscription plans and pricing
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                    Create New Payment Plan
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Plan Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                        placeholder="e.g., Premium Plan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="price"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Price (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                        placeholder="999"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="durationType"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Duration Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.durationType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, durationType: value })
                        }
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                          <SelectItem value="until_date">
                            Until Specific Date
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      {formData.durationType === 'until_date' ? (
                        <div>
                          <Label
                            htmlFor="untilDate"
                            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                          >
                            Until Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="untilDate"
                            type="date"
                            value={formData.untilDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                untilDate: e.target.value,
                              })
                            }
                            required
                            className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                          />
                        </div>
                      ) : (
                        <div>
                          <Label
                            htmlFor="duration"
                            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                          >
                            Duration <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: e.target.value,
                              })
                            }
                            required
                            className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                            min="1"
                            placeholder="30"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Number of {formData.durationType}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="discount"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Discount (%)
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({ ...formData, discount: e.target.value })
                        }
                        placeholder="0"
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <Label className="text-sm text-green-700 dark:text-green-300 font-medium">
                          Final Price
                        </Label>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ₹{calculateDiscountedPrice().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      placeholder="Describe the plan features and benefits..."
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor="isActive"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Active Plan
                    </Label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Plans
                  </p>
                  <p className="text-3xl font-bold">{plans.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Active Plans
                  </p>
                  <p className="text-3xl font-bold">
                    {plans.filter((p) => p.isActive).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Discounted Plans
                  </p>
                  <p className="text-3xl font-bold">
                    {plans.filter((p) => p.discount > 0).length}
                  </p>
                </div>
                <Percent className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Avg Price
                  </p>
                  <p className="text-3xl font-bold">
                    ₹
                    {plans.length > 0
                      ? Math.round(
                          plans.reduce((sum, p) => sum + p.price, 0) /
                            plans.length
                        )
                      : 0}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan)
            const gradientClass = getPlanColor(plan)

            return (
              <Card
                key={plan.id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800"
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${gradientClass} text-white`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-slate-900 dark:text-white">
                          {plan.name}
                        </CardTitle>
                        <Badge
                          variant="default"
                          className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        >
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Duration:
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatDuration(plan)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Original Price:
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₹{plan.price}
                      </span>
                    </div>

                    {plan.discount && plan.discount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2">
                          <Percent className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-300">
                            Discount:
                          </span>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {plan.discount}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Final Price:
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ₹
                        {plan.discount
                          ? (
                              plan.price -
                              (plan.price * plan.discount) / 100
                            ).toFixed(2)
                          : plan.price}
                      </span>
                    </div>
                  </div>

                  {plan.description && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(plan)}
                      className="flex-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(plan)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deactivate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit Payment Plan
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Plan Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-price"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Price (₹)
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-durationType"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Duration Type
                  </Label>
                  <Select
                    value={formData.durationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, durationType: value })
                    }
                  >
                    <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="until_date">
                        Until Specific Date
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {formData.durationType === 'until_date' ? (
                    <div>
                      <Label
                        htmlFor="edit-untilDate"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Until Date
                      </Label>
                      <Input
                        id="edit-untilDate"
                        type="date"
                        value={formData.untilDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            untilDate: e.target.value,
                          })
                        }
                        required
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label
                        htmlFor="edit-duration"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Duration
                      </Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        required
                        className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-discount"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Discount (%)
                  </Label>
                  <Input
                    id="edit-discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    placeholder="0"
                    className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Label className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Final Price
                    </Label>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{calculateDiscountedPrice().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor="edit-isActive"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Active Plan
                </Label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Update Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Deactivate Payment Plan
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to deactivate the plan{' '}
                <strong className="text-slate-900 dark:text-white">
                  "{deletingPlan?.name}"
                </strong>
                ? This will remove it from active plans but preserve all payment
                data.
              </p>

              {deletingPlan && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Warning:</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    This will deactivate the plan and remove it from active
                    plans. If this plan has existing payments, they will remain
                    in the system and user subscriptions will remain active
                    until their expiration date. You can reactivate the plan
                    later if needed.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false)
                    setDeletingPlan(null)
                  }}
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
