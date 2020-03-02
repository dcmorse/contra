import React from "react"

export const OpenSideTabToggle = ({
  label,
  onToggle,
}: {
  label: "program" | "filters"
  onToggle: () => void
}): JSX.Element => {
  const onRightSide = label === "program"
  const buttonClass = label === "program" ? "toggle-program" : "toggle-filters"
  const glyphicon = onRightSide ? "glyphicon-menu-right" : "glyphicon-menu-left"
  const button = (
    <div>
      <div className={`side-panel-toggle side-panel-toggle-open`}>
        <button className={buttonClass} onClick={onToggle}>
          <h2>
            {onRightSide || label}
            <span className={"glyphicon " + glyphicon} />
            {onRightSide && label}
          </h2>
        </button>
      </div>
    </div>
  )
  return button
}

export default OpenSideTabToggle
