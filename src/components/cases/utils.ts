export const priorityColors: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-orange-100 text-orange-700 border-orange-200",
    Low: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

export const statusStyles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "Under Review": "bg-blue-100 text-blue-700 border border-blue-200",
    Mediation: "bg-purple-100 text-purple-700 border border-purple-200",
    Resolved: "bg-green-100 text-green-700 border border-green-200",
    Closed: "bg-slate-100 text-slate-600 border border-slate-200",
    Dismissed: "bg-red-100 text-red-700 border border-red-200",
}

export const categoryMeta = [
    {
        key: "violence",
        name: "Violence or Threats",
        shortName: "Violence/Threats",
        badge: "bg-pink-100 text-pink-700 border border-pink-200",
    },
    {
        key: "harassment",
        name: "Harassment & Abuse",
        shortName: "Harassment",
        badge: "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200",
    },
    {
        key: "fraud",
        name: "Fraud & Scams",
        shortName: "Fraud/Scams",
        badge: "bg-lime-100 text-lime-700 border border-lime-200",
    },
    {
        key: "disturbance",
        name: "Public Disturbance",
        shortName: "Public Disturb.",
        badge: "bg-sky-100 text-sky-700 border border-sky-200",
    },
    {
        key: "property",
        name: "Property & Theft",
        shortName: "Property/Theft",
        badge: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    },
    {
        key: "community",
        name: "Community Dispute",
        shortName: "Community Disp.",
        badge: "bg-teal-100 text-teal-700 border border-teal-200",
    },
    {
        key: "child",
        name: "Child & Vulnerable",
        shortName: "Child/Vulnerable",
        badge: "bg-violet-100 text-violet-700 border border-violet-200",
    },
]

export const statusFlow = {
    Pending: ["Under Review", "Dismissed"],
    "Under Review": ["Mediation", "Dismissed"],
    Mediation: ["Resolved", "Dismissed"],
    Resolved: ["Closed"],
    Closed: [],
    Dismissed: [],
}

export const statusMessages: Record<
    string,
    {
        title: string
        button: string
        body: string
    }
> = {
    "Pending->Under Review": {
        title: "Move Case to Under Review",
        button: "Continue",
        body:
        "You are about to move this case from Pending to Under Review.\n\nOnce this change has been made, it cannot be automatically reverted.\n\nThis action will be recorded in the case timeline.",
    },

    "Under Review->Mediation": {
        title: "Move Case to Mediation",
        button: "Continue",
        body:
        "The case will now proceed to mediation.\n\nResidents and assigned officers may receive updates.\n\nThis action is permanent.",
    },

    "Mediation->Resolved": {
        title: "Resolve Case",
        button: "Resolve Case",
        body:
        "This case will be marked as Resolved.\n\nResolved cases are removed from Active Cases and placed into the Archive.\n\nYou can still access archived cases at any time.",
    },

    "Resolved->Closed": {
        title: "Close Case",
        button: "Close Case",
        body:
        "Closing this case finalizes all case activities.\n\nThe case will permanently remain in the Archive.",
    },

    "Any->Dismissed": {
        title: "Dismiss Case",
        button: "Dismiss Case",
        body:
        "This case will be marked as Dismissed.\n\nThis action is permanent and will be recorded in the case timeline.",
    },
}

export const getPriorityStyle = (priority: string) => {
    switch (priority) {
        case "High":
            return "bg-red-100 text-red-700 border-red-200"
        case "Medium":
            return "bg-yellow-100 text-yellow-700 border-yellow-200"
        case "Low":
            return "bg-green-100 text-green-700 border-green-200"
        default:
            return "bg-muted text-muted-foreground border-border"
        }
}

export const getStatusStyle = (status: string) => {
    switch (status) {
        case "Pending":
            return "bg-yellow-100 text-yellow-700 border-yellow-200"
        case "Under Review":
            return "bg-blue-100 text-blue-700 border-blue-200"
        case "Mediation":
            return "bg-purple-100 text-purple-700 border-purple-200"
        case "Resolved":
            return "bg-green-100 text-green-700 border-green-200"
        case "Closed":
            return "bg-slate-100 text-slate-700 border-slate-200"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

export const getCategoryStyle = (category: string) => {
    switch (category) {
    case "Violence or Threats":
        return "bg-pink-100 text-pink-700 border-pink-200"
    case "Harassment & Abuse":
        return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200"
    case "Fraud & Scams":
        return "bg-lime-100 text-lime-700 border-lime-200"
    case "Public Disturbance":
        return "bg-sky-100 text-sky-700 border-sky-200"
    case "Property & Theft":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
    case "Community Dispute":
        return "bg-teal-100 text-teal-700 border-teal-200"
    case "Child & Vulnerable":
        return "bg-violet-100 text-violet-700 border-violet-200"
    default:
        return "bg-muted text-muted-foreground border-border"
    }
}

export const getCategoryMeta = (category: string) => {
    return (
        categoryMeta.find(
        (c) =>
        category
            .toLowerCase()
            .includes(c.name.toLowerCase())
        ) ?? categoryMeta[0]
    )
}

export const getOfficerCardBorder = (officer?: string | null) => {
    if (!officer || officer === "Unassigned") {
        return "border-slate-200"
    }
    return "border-blue-200"
}

export const getStatusCardBorder = (status: string) => {
    switch (status) {
        case "Pending":
            return "border-yellow-200"
        case "Under Review":
            return "border-sky-200"
        case "Mediation":
            return "border-violet-200"
        case "Resolved":
            return "border-emerald-200"
        case "Closed":
            return "border-slate-300"
        case "Dismissed":
            return "border-rose-200"
        default:
            return "border-border"
    }
}