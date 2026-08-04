/* oxlint-disable react/only-export-components -- Ant Design-compatible compound component API. */
import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import type {
  BreadcrumbItemProps,
  BreadcrumbItemType,
  BreadcrumbMenuClickInfo,
  BreadcrumbMenuItem,
  BreadcrumbParams,
  BreadcrumbProps,
  BreadcrumbRouteItem,
  BreadcrumbSemanticClassNames,
  BreadcrumbSemanticStyles,
  BreadcrumbSeparatorItem,
  BreadcrumbSeparatorProps,
} from './Breadcrumb.types'
import '../../styles/tokens.css'
import './Breadcrumb.css'

const DEFAULT_SEPARATOR = '/'
const EMPTY_CLASSES: BreadcrumbSemanticClassNames = {}
const EMPTY_STYLES: BreadcrumbSemanticStyles = {}

type LegacyComponent<P> = ((props: P) => ReactNode) & { __ORBIT_BREADCRUMB_TYPE: 'item' | 'separator' }

const BreadcrumbItem = ((_props: BreadcrumbItemProps) => null) as LegacyComponent<BreadcrumbItemProps>
BreadcrumbItem.__ORBIT_BREADCRUMB_TYPE = 'item'

const BreadcrumbSeparator = ((_props: BreadcrumbSeparatorProps) => null) as LegacyComponent<BreadcrumbSeparatorProps>
BreadcrumbSeparator.__ORBIT_BREADCRUMB_TYPE = 'separator'

function legacyItems(children: ReactNode): BreadcrumbItemType[] {
  const result: BreadcrumbItemType[] = []
  Children.toArray(children).forEach((child, index) => {
    if (!isValidElement(child)) return
    const marker = (child.type as Partial<LegacyComponent<never>>).__ORBIT_BREADCRUMB_TYPE
    if (marker === 'separator') {
      const props = (child as ReactElement<BreadcrumbSeparatorProps>).props
      result.push({ key: index, type: 'separator', separator: props.children ?? props.separator } satisfies BreadcrumbSeparatorItem)
      return
    }
    if (marker === 'item') {
      const props = (child as ReactElement<BreadcrumbItemProps>).props
      const { children: title, separator: _separator, ...route } = props
      result.push({ ...route, key: route.key ?? index, title } satisfies BreadcrumbRouteItem)
    }
  })
  return result
}

function replaceParams(value: ReactNode, params: BreadcrumbParams) {
  if (typeof value !== 'string') return value
  return value.replace(/:([A-Za-z0-9_]+)/g, (match, key: string) => params[key] == null ? match : String(params[key]))
}

function resolvePath(path: string | undefined, params: BreadcrumbParams) {
  if (path === undefined) return undefined
  return String(replaceParams(path.replace(/^\//, ''), params))
}

function semanticValue<T extends BreadcrumbParams, V>(value: V | ((info: { props: BreadcrumbProps<T> }) => V) | undefined, props: BreadcrumbProps<T>, fallback: V) {
  return typeof value === 'function' ? (value as (info: { props: BreadcrumbProps<T> }) => V)({ props }) : value ?? fallback
}

function routeAttributes(route: BreadcrumbRouteItem) {
  const attributes: Record<string, unknown> = {}
  Object.entries(route).forEach(([key, value]) => {
    if (key.startsWith('aria-') || key.startsWith('data-')) attributes[key] = value
  })
  return attributes
}

function joinClasses(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ')
}

function DefaultDropdownIcon() {
  return <span className="orbit-breadcrumb__dropdown-chevron" aria-hidden />
}

function menuHref(parentHref: string | undefined, item: BreadcrumbMenuItem) {
  if (item.href) return item.href
  if (!item.path) return undefined
  if (!parentHref) return item.path
  return `${parentHref.replace(/\/$/, '')}/${item.path.replace(/^\//, '')}`
}

function DropdownCrumb({
  route,
  content,
  href,
  dropdownIcon,
  isLast,
}: {
  route: BreadcrumbRouteItem
  content: ReactNode
  href?: string
  dropdownIcon: ReactNode
  isLast: boolean
}) {
  const dropdown = route.dropdownProps
  const controlledOpen = dropdown?.open
  const controlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(dropdown?.defaultOpen ?? false)
  const open = controlledOpen ?? internalOpen
  const triggerTypes = dropdown?.trigger ?? ['hover']
  const disabled = dropdown?.disabled ?? false
  const onOpenChange = dropdown?.onOpenChange
  const getPopupContainer = dropdown?.getPopupContainer
  const placement = dropdown?.placement
  const rootRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const focusMenuOnOpen = useRef(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [portalStyle, setPortalStyle] = useState<CSSProperties>()
  const popupId = `orbit-breadcrumb-menu-${useId().replace(/:/g, '')}`

  const setOpen = useCallback((next: boolean, source: 'trigger' | 'menu') => {
    if (disabled) return
    if (!controlled) setInternalOpen(next)
    onOpenChange?.(next, { source })
  }, [controlled, disabled, onOpenChange])
  const clearCloseTimer = () => {
    if (closeTimer.current !== undefined) window.clearTimeout(closeTimer.current)
  }
  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => setOpen(false, 'trigger'), 120)
  }

  useEffect(() => () => clearCloseTimer(), [])
  useEffect(() => {
    if (!open) return
    const pointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false, 'trigger')
    }
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false, 'trigger')
      triggerRef.current?.focus()
    }
    const focus = (event: FocusEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false, 'trigger')
    }
    document.addEventListener('pointerdown', pointer)
    document.addEventListener('keydown', keyboard)
    document.addEventListener('focusin', focus)
    return () => {
      document.removeEventListener('pointerdown', pointer)
      document.removeEventListener('keydown', keyboard)
      document.removeEventListener('focusin', focus)
    }
  }, [open, setOpen])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !getPopupContainer) {
      setPortalTarget(null)
      setPortalStyle(undefined)
      return
    }
    const triggerNode = triggerRef.current
    const container = getPopupContainer(triggerNode)
    const updatePosition = () => {
      const triggerRect = triggerNode.getBoundingClientRect()
      const containerRect = container === document.body ? { top: 0, left: 0 } : container.getBoundingClientRect()
      const resolvedPlacement = placement ?? 'bottom'
      const isTop = resolvedPlacement.startsWith('top')
      const isRight = resolvedPlacement.endsWith('Right')
      const isCenter = resolvedPlacement === 'top' || resolvedPlacement === 'bottom'
      const anchorLeft = isRight ? triggerRect.right : isCenter ? triggerRect.left + triggerRect.width / 2 : triggerRect.left
      const translateX = isRight ? '-100%' : isCenter ? '-50%' : '0'
      const translateY = isTop ? '-100%' : '0'
      setPortalStyle({
        position: container === document.body ? 'fixed' : 'absolute',
        top: (isTop ? triggerRect.top - 4 : triggerRect.bottom + 4) - containerRect.top,
        right: 'auto',
        bottom: 'auto',
        left: anchorLeft - containerRect.left,
        transform: `translate(${translateX}, ${translateY})`,
      })
    }
    setPortalTarget(container)
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [getPopupContainer, open, placement])

  useEffect(() => {
    if (!open || !focusMenuOnOpen.current) return
    focusMenuOnOpen.current = false
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus()
  }, [open, portalTarget])

  const onTriggerClick = (event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    route.onClick?.(event)
    if (!triggerTypes.includes('click') || disabled || event.defaultPrevented) return
    event.preventDefault()
    setOpen(!open, 'trigger')
  }
  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!['ArrowDown', 'Enter', ' '].includes(event.key) || disabled) return
    event.preventDefault()
    focusMenuOnOpen.current = true
    setOpen(true, 'trigger')
  }
  const onMenuItem = (item: BreadcrumbMenuItem, key: string, event: ReactMouseEvent<HTMLElement>) => {
    if (item.disabled) {
      event.preventDefault()
      return
    }
    const info: BreadcrumbMenuClickInfo = { key: item.key ?? key, domEvent: event }
    item.onClick?.(info)
    route.menu?.onClick?.(info)
    setOpen(false, 'menu')
    triggerRef.current?.focus()
  }
  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const targets = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])]
    if (!targets.length) return
    event.preventDefault()
    const current = targets.indexOf(document.activeElement as HTMLElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? targets.length - 1 : event.key === 'ArrowDown' ? (current + 1) % targets.length : (current <= 0 ? targets.length : current) - 1
    targets[next]?.focus()
  }

  const trigger = href && !disabled
    ? <a {...routeAttributes(route)} ref={(node) => { triggerRef.current = node }} className={joinClasses('orbit-breadcrumb__dropdown-trigger', route.className)} style={route.style} aria-haspopup="menu" aria-expanded={open} aria-controls={popupId} aria-current={isLast ? 'page' : undefined} onClick={onTriggerClick} onKeyDown={onTriggerKeyDown} href={href}>{content}{dropdownIcon}</a>
    : <button {...routeAttributes(route)} ref={(node) => { triggerRef.current = node }} className={joinClasses('orbit-breadcrumb__dropdown-trigger', route.className)} style={route.style} aria-haspopup="menu" aria-expanded={open} aria-controls={popupId} aria-current={isLast ? 'page' : undefined} onClick={onTriggerClick} onKeyDown={onTriggerKeyDown} type="button" disabled={disabled}>{content}{dropdownIcon}</button>

  const menu = open ? <div
    ref={menuRef}
    id={popupId}
    role="menu"
    aria-label={`${typeof content === 'string' ? content : 'Breadcrumb'} 하위 메뉴`}
    className={joinClasses('orbit-breadcrumb__menu', `orbit-breadcrumb__menu--${placement ?? 'bottom'}`, route.menu?.className, dropdown?.className, dropdown?.overlayClassName)}
    style={{ ...portalStyle, ...route.menu?.style, ...dropdown?.style }}
    onKeyDown={onMenuKeyDown}
    onPointerEnter={clearCloseTimer}
    onPointerLeave={triggerTypes.includes('hover') ? scheduleClose : undefined}
  >{route.menu?.items?.map((item, index) => {
    if (item.type === 'divider') return <div key={item.key ?? `divider-${index}`} className="orbit-breadcrumb__menu-divider" role="separator" />
    const key = String(item.key ?? index)
    const target = menuHref(href, item)
    const label = item.label ?? item.title
    const menuProps = {
      role: 'menuitem' as const,
      className: joinClasses('orbit-breadcrumb__menu-item', item.danger && 'is-danger', item.className),
      style: item.style,
      'aria-disabled': item.disabled || undefined,
      tabIndex: item.disabled ? -1 : 0,
      onClick: (event: ReactMouseEvent<HTMLElement>) => onMenuItem(item, key, event),
    }
    return target && !item.disabled
      ? <a {...menuProps} key={key} href={target}>{item.icon}<span>{label}</span></a>
      : <button {...menuProps} key={key} type="button" disabled={item.disabled}>{item.icon}<span>{label}</span></button>
  })}</div> : null

  return <span
    ref={rootRef}
    className="orbit-breadcrumb__dropdown"
    onPointerEnter={triggerTypes.includes('hover') ? () => { clearCloseTimer(); setOpen(true, 'trigger') } : undefined}
    onPointerLeave={triggerTypes.includes('hover') ? scheduleClose : undefined}
  >{trigger}{portalTarget && menu ? createPortal(menu, portalTarget) : menu}</span>
}

function InternalBreadcrumb<T extends BreadcrumbParams = BreadcrumbParams>(props: BreadcrumbProps<T>, ref: React.ForwardedRef<HTMLElement>) {
  const {
    items,
    routes,
    itemRender,
    params = {} as T,
    separator = DEFAULT_SEPARATOR,
    dropdownIcon = <DefaultDropdownIcon />,
    classNames,
    styles,
    rootClassName,
    className,
    style,
    children,
    'aria-label': ariaLabel = 'Breadcrumb',
    ...nativeProps
  } = props
  const resolvedItems = items ?? routes ?? legacyItems(children)
  const semanticProps = { ...props, separator }
  const semanticClasses = semanticValue(classNames, semanticProps, EMPTY_CLASSES)
  const semanticStyles = semanticValue(styles, semanticProps, EMPTY_STYLES)
  const paths: string[] = []

  return <nav
    {...nativeProps}
    ref={ref}
    aria-label={ariaLabel}
    className={joinClasses('orbit-breadcrumb', semanticClasses.root, className, rootClassName)}
    style={{ ...semanticStyles.root, ...style }}
  ><ol>{resolvedItems.map((item, index) => {
    if (item.type === 'separator') {
      return <li key={item.key ?? `separator-${index}`} className={joinClasses('orbit-breadcrumb__separator', semanticClasses.separator)} style={semanticStyles.separator} aria-hidden>{item.separator ?? separator}</li>
    }
    const rawRoute = item as BreadcrumbRouteItem
    const route = rawRoute.children?.length && !rawRoute.menu ? {
      ...rawRoute,
      menu: {
        items: rawRoute.children.map((child, childIndex) => ({
          key: child.key ?? childIndex,
          label: child.title ?? child.breadcrumbName,
          path: child.path,
          href: child.href,
        })),
      },
    } : rawRoute
    const path = resolvePath(route.path, params)
    if (path !== undefined) paths.push(path)
    const href = path !== undefined ? `#/${paths.join('/')}` : route.href
    const routeTitle = replaceParams(route.title ?? route.breadcrumbName, params)
    const content = itemRender ? itemRender(route, params, items ?? routes ?? resolvedItems, [...paths]) : routeTitle
    const isLast = index === resolvedItems.length - 1
    const nextIsExplicitSeparator = resolvedItems[index + 1]?.type === 'separator'
    const linkAttributes = routeAttributes(route)
    const rendered = route.menu
      ? <DropdownCrumb route={route} content={content} href={href} dropdownIcon={dropdownIcon} isLast={isLast} />
      : itemRender
        ? content
      : href !== undefined
        ? <a {...linkAttributes} className={joinClasses('orbit-breadcrumb__link', route.className)} style={route.style} href={href} aria-current={isLast ? 'page' : undefined} onClick={route.onClick}>{content}</a>
        : <span {...linkAttributes} className={joinClasses('orbit-breadcrumb__link', route.className)} style={route.style} aria-current={isLast ? 'page' : undefined} onClick={route.onClick}>{content}</span>
    return <li key={route.key ?? index} className={joinClasses('orbit-breadcrumb__item', semanticClasses.item)} style={semanticStyles.item}>{rendered}{!isLast && !nextIsExplicitSeparator ? <span className={joinClasses('orbit-breadcrumb__separator', semanticClasses.separator)} style={semanticStyles.separator} aria-hidden>{separator}</span> : null}</li>
  })}</ol></nav>
}

export type BreadcrumbComponent = (<T extends BreadcrumbParams = BreadcrumbParams>(props: BreadcrumbProps<T> & RefAttributes<HTMLElement>) => ReactElement | null) & {
  /** @deprecated Use items. */
  Item: typeof BreadcrumbItem
  /** @deprecated Use separator or a separator item. */
  Separator: typeof BreadcrumbSeparator
}

export const Breadcrumb = forwardRef(InternalBreadcrumb) as unknown as BreadcrumbComponent
Breadcrumb.Item = BreadcrumbItem
Breadcrumb.Separator = BreadcrumbSeparator
