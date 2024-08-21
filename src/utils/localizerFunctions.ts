export async function createDate(formattedDate: any) {
  if (figma.currentPage.selection.length > 0) {
    for (const node of figma.currentPage.selection) {
      if ("characters" in node) {
        await Promise.all(
          node.getRangeAllFontNames(0, node.characters.length)
            .map(figma.loadFontAsync)
        )

        node.characters = formattedDate
      }
    }
  } else {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" })
    const nodes: Array<SceneNode> = []
    const textNode = figma.createText()

    textNode.characters = formattedDate
    figma.currentPage.appendChild(textNode)
    nodes.push(textNode)
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
  }
}

export async function createTime(formattedTime: any) {
  if (figma.currentPage.selection.length > 0) {
    for (const node of figma.currentPage.selection) {
      if ("characters" in node) {
        await Promise.all(
          node.getRangeAllFontNames(0, node.characters.length)
            .map(figma.loadFontAsync)
        )

        node.characters = formattedTime
      }
    }
  } else {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" })
    const nodes: Array<SceneNode> = []
    const textNode = figma.createText()

    textNode.characters = formattedTime
    figma.currentPage.appendChild(textNode)
    nodes.push(textNode)
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
  }
}

export async function createNumber(formattedNumber: any) {
  if (figma.currentPage.selection.length > 0) {
    for (const node of figma.currentPage.selection) {
      if ("characters" in node) {
        await Promise.all(
          node.getRangeAllFontNames(0, node.characters.length)
            .map(figma.loadFontAsync)
        )

        node.characters = formattedNumber
      }
    }
  } else {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" })
    const nodes: Array<SceneNode> = []
    const textNode = figma.createText()

    textNode.characters = formattedNumber
    figma.currentPage.appendChild(textNode)
    nodes.push(textNode)
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
  }
}