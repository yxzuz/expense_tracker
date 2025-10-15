export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Your Mindful Expense Tracker
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Take a gentle approach to tracking your expenses and understanding your spending patterns. 
          Start by adding your first expense, or explore your financial journey below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Total Balance</div>
            <div className="card-description">Your current financial standing</div>
          </div>
          <div className="card-content">
            <div className="text-3xl font-bold text-foreground">$0.00</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">This Month</div>
            <div className="card-description">Total spending this month</div>
          </div>
          <div className="card-content">
            <div className="text-3xl font-bold text-foreground">$0.00</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Remaining</div>
            <div className="card-description">Left in your budget</div>
          </div>
          <div className="card-content">
            <div className="text-3xl font-bold text-success-600">--</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Getting Started</div>
          <div className="card-description">
            Your expense tracking journey begins here
          </div>
        </div>
        <div className="card-content">
          <p className="text-muted-foreground mb-4">
            No expenses tracked yet. Ready to start your mindful spending journey?
          </p>
          <a 
            href="/add-expense/" 
            className="btn btn-primary btn-lg"
          >
            Add Your First Expense
          </a>
        </div>
      </div>
    </div>
  )
}