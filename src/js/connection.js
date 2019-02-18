import rootsStore from './rootsStore';

export default class Connection {
    constructor(driver) {
        this.driver = driver

        this.driver.onMessage = (payload) => {
            this.onMessage(payload)
        }

        this.driver.refreshDom = (payload) => {
            this.refreshDom()
        }
    }

    init() {
        this.driver.init()

        return this
    }

    onMessage(payload) {
        const { id, dom, dirtyInputs, serialized, redirectTo, ref, callOnParent } = payload

        if (redirectTo) {
            window.location.href = redirectTo
            return
        }

        rootsStore[id].replace(dom, dirtyInputs, serialized)

        if (ref) {
            rootsStore[id].unsetLoading(ref)
        }

        if (callOnParent) {
            this.sendMethod(callOnParent.method, callOnParent.params, rootsStore[id].parent, true)
        }
    }

    sendMessage(data, root, fromCallOnParent) {
        this.driver.sendMessage({
            ...data,
            ...{ serialized: root.serialized },
        });
    }

    refreshDom() {
        rootsStore.forEach(root => {
            this.sendMessage({ id: root.id, event: 'refresh' }, root)
        })
    }

    sendMethod(method, params, root, ref, fromCallOnParent) {
        if (ref) {
            root.setLoading(ref)
        }

        this.sendMessage({
            id: root.id,
            event: 'fireMethod',
            data: {
                method,
                params,
                ref,
            },
        }, root, fromCallOnParent)
    }

    sendSync(name, value, root) {
        this.sendMessage({
            event: 'syncInput',
            data: { name, value },
        }, root)
    }
}