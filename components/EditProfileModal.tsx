"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Pencil, User, Loader2 } from "lucide-react"

interface EditProfileModalProps {
    user: {
        id: string
        full_name: string
        email: string
        registration_number: string | null
        department: string | null
    }
}

export function EditProfileModal({ user }: EditProfileModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState(user.full_name)
    const [regNo, setRegNo] = useState(user.registration_number || "")
    const [dept, setDept] = useState(user.department || "")
    const router = useRouter()
    const supabase = createClient()

    async function handleUpdate() {
        if (!fullName.trim()) {
            toast.error("Full name is required")
            return
        }

        setLoading(true)
        const { error } = await supabase
            .from('users')
            .update({
                full_name: fullName,
                registration_number: regNo,
                department: dept,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) {
            console.error("Profile update error:", error)
            toast.error(`Failed to update profile: ${error.message}`)
        } else {
            toast.success("Profile updated successfully")
            setOpen(false)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="w-4 h-4" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        Edit Personal Information
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Full Name
                        </label>
                        <Input
                            id="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="regNo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Registration Number
                        </label>
                        <Input
                            id="regNo"
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value)}
                            placeholder="e.g. 123456"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="dept" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Department
                        </label>
                        <Input
                            id="dept"
                            value={dept}
                            onChange={(e) => setDept(e.target.value)}
                            placeholder="e.g. Computer Science"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground">
                            Email (Cannot be changed)
                        </label>
                        <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-muted text-muted-foreground"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
