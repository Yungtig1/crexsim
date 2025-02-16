export function ActionButton({ icon: Icon, label }) {
    return (
      <button className="flex flex-col items-center gap-2">
        <div className="bg-primary rounded-full p-4 hover:bg-primary/90 transition-colors">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-sm text-foreground">{label}</span>
      </button>
    )
  }
  
  