"use client"

import { HelpCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { driver, type DriveStep, type Driver } from "driver.js"
import { Button } from "@/components/ui/button"

const seenStorageKey = "creatoros.dashboardGuide.seen.v1"

type GuideStepKey =
  | "hero"
  | "actions"
  | "metrics"
  | "monthlyPlan"
  | "accountDna"
  | "workflow"
  | "feedbackLoop"

const stepDefinitions: { key: GuideStepKey; selector: string; side: "top" | "right" | "bottom" | "left"; align: "start" | "center" | "end" }[] = [
  { key: "hero", selector: '[data-guide="dashboard-hero"]', side: "bottom", align: "start" },
  { key: "actions", selector: '[data-guide="dashboard-actions"]', side: "left", align: "start" },
  { key: "metrics", selector: '[data-guide="dashboard-metrics"]', side: "bottom", align: "start" },
  { key: "monthlyPlan", selector: '[data-guide="dashboard-monthly-plan"]', side: "right", align: "start" },
  { key: "accountDna", selector: '[data-guide="dashboard-account-dna"]', side: "left", align: "start" },
  { key: "workflow", selector: '[data-guide="dashboard-workflow"]', side: "top", align: "start" },
  { key: "feedbackLoop", selector: '[data-guide="dashboard-feedback-loop"]', side: "top", align: "start" },
]

export function DashboardGuide() {
  const t = useTranslations("dashboardGuide")
  const driverRef = useRef<Driver | null>(null)
  const steps = useMemo(
    () =>
      stepDefinitions.map((step) => ({
        element: step.selector,
        popover: {
          title: t(`steps.${step.key}.title`),
          description: t(`steps.${step.key}.description`),
          side: step.side,
          align: step.align,
        },
      })),
    [t],
  )

  const startGuide = useCallback((allSteps: DriveStep[], markSeenOnClose: boolean) => {
    const availableSteps = allSteps.filter((step) => {
      const selector = typeof step.element === "string" ? step.element : undefined
      const element = selector ? document.querySelector(selector) : undefined
      return Boolean(element && element.getClientRects().length > 0)
    })

    if (!availableSteps.length) {
      return
    }

    driverRef.current?.destroy()
    const driverObj = driver({
      steps: availableSteps,
      showProgress: true,
      progressText: t("progress"),
      nextBtnText: t("buttons.next"),
      prevBtnText: t("buttons.previous"),
      doneBtnText: t("buttons.done"),
      allowKeyboardControl: true,
      stagePadding: 8,
      stageRadius: 16,
      overlayOpacity: 0.48,
      popoverClass: "creatoros-driver-popover",
      onDestroyed: () => {
        if (markSeenOnClose) {
          window.localStorage.setItem(seenStorageKey, "true")
        }
      },
    })

    driverRef.current = driverObj
    driverObj.drive()
  }, [t])

  useEffect(() => {
    if (window.localStorage.getItem(seenStorageKey) === "true") {
      return
    }

    const timer = window.setTimeout(() => {
      startGuide(steps, true)
    }, 600)

    return () => {
      window.clearTimeout(timer)
      driverRef.current?.destroy()
    }
  }, [startGuide, steps])

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => startGuide(steps, false)}
      className="h-10"
    >
      <HelpCircle data-icon="inline-start" />
      {t("button")}
    </Button>
  )
}
