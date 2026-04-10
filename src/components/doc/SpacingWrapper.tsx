export function SpacingWrapper(props: React.PropsWithChildren) {
  return <div className="not-first:mt-5">{props.children}</div>
}
