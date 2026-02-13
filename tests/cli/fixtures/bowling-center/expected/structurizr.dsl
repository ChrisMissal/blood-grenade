workspace {

  model {
    person Team
    softwareSystem CurrentSystem "On-prem lane management and POS"
    softwareSystem TargetSystem "Cloud-managed bowling center platform"

    CurrentSystem -> TargetSystem "Transforms via streams"
    softwareSystem Stream1 "Lane Control Modernization"
    CurrentSystem -> Stream1 "Replace lane controllers with centrally managed edge services"
    Stream1 -> TargetSystem "Contributes to target"

    softwareSystem Stream2 "Booking and Payments"
    CurrentSystem -> Stream2 "Unify online booking, kiosk, and front desk payments"
    Stream2 -> TargetSystem "Contributes to target"

    softwareSystem Stream3 "Center Insights"
    CurrentSystem -> Stream3 "Introduce analytics for lane utilization and snack bar sales"
    Stream3 -> TargetSystem "Contributes to target"

    softwareSystem Stream4 "Operational Runbooks"
    CurrentSystem -> Stream4 "Standardize incident runbooks for scoring outages"
    Stream4 -> TargetSystem "Contributes to target"
  }

  views {
    systemContext CurrentSystem {
      include *
      autoLayout
    }
  }
}
