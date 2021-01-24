import { createApp, nextTick } from "vue"
import { EventBus } from "./eventBus"
const mount = require("mount-vue-component")
import ToastContainer from "../components/VtToastContainer.vue"
import {
  ToastContent,
  ToastOptions,
  ToastID,
  PluginOptions,
  ToastOptionsAndRequiredContent,
} from "../types"
import { TYPE, EVENTS } from "./constants"
import { getId, isUndefined } from "./utils"

export const buildInterface = (
  globalOptions: PluginOptions = {},
  mountContainer = true
) => {
  const events = (globalOptions.eventBus =
    globalOptions.eventBus || new EventBus())
  if (mountContainer) {
    nextTick(() => {
      /*
      const app = createApp(ToastContainer, {
        ...globalOptions,
      })
      const component = app.mount(document.createElement("div"))
      */
      if (!globalOptions._________app) {
        console.log("app is required for toast creation.")
        return
      }
      const { vNode, destroy, el } = mount(ToastContainer, {
        app: globalOptions._________app,
        props: {
          ...globalOptions,
        },
      })
      const onMounted = globalOptions.onMounted
      if (!isUndefined(onMounted)) {
        if (vNode.component?.proxy && vNode.appContext?.app) {
          onMounted(vNode.component?.proxy, vNode.appContext?.app)
        }
      }
    })
  }
  /**
   * Display a toast
   */
  const toast = (content: ToastContent, options?: ToastOptions): ToastID => {
    const props: ToastOptionsAndRequiredContent & {
      id: ToastID
    } = Object.assign({}, { id: getId(), type: TYPE.DEFAULT }, options, {
      content,
    })
    events.emit(EVENTS.ADD, props)
    return props.id
  }
  /**
   * Clear all toasts
   */
  toast.clear = () => events.emit(EVENTS.CLEAR, undefined)
  /**
   * Update Plugin Defaults
   */
  toast.updateDefaults = (update: PluginOptions) => {
    events.emit(EVENTS.UPDATE_DEFAULTS, update)
  }
  /**
   * Dismiss toast specified by an id
   */
  toast.dismiss = (id: ToastID) => {
    events.emit(EVENTS.DISMISS, id)
  }
  /**
   * Update Toast
   */
  function updateToast(
    id: ToastID,
    { content, options }: { content?: ToastContent; options?: ToastOptions },
    create?: false
  ): void
  function updateToast(
    id: ToastID,
    { content, options }: { content: ToastContent; options?: ToastOptions },
    create?: true
  ): void
  function updateToast(
    id: ToastID,
    { content, options }: { content?: ToastContent; options?: ToastOptions },
    create = false
  ): void {
    const opt = Object.assign({}, options, { content }) as ToastOptions & {
      content: ToastContent
    }
    events.emit(EVENTS.UPDATE, {
      id,
      options: opt,
      create,
    })
  }
  toast.update = updateToast
  /**
   * Display a success toast
   */
  toast.success = (
    content: ToastContent,
    options?: ToastOptions & { type?: TYPE.SUCCESS }
  ) => toast(content, Object.assign({}, options, { type: TYPE.SUCCESS }))

  /**
   * Display an info toast
   */
  toast.info = (
    content: ToastContent,
    options?: ToastOptions & { type?: TYPE.INFO }
  ) => toast(content, Object.assign({}, options, { type: TYPE.INFO }))

  /**
   * Display an error toast
   */
  toast.error = (
    content: ToastContent,
    options?: ToastOptions & { type?: TYPE.ERROR }
  ) => toast(content, Object.assign({}, options, { type: TYPE.ERROR }))

  /**
   * Display a warning toast
   */
  toast.warning = (
    content: ToastContent,
    options?: ToastOptions & { type?: TYPE.WARNING }
  ) => toast(content, Object.assign({}, options, { type: TYPE.WARNING }))

  return toast
}

export type ToastInterface = ReturnType<typeof buildInterface>
