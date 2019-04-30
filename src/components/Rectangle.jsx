import React, { Component } from 'react';
import {
  Rect, Group, Label, Text,
} from 'react-konva';
import TransformerComponent from './TransformerComponent.jsx';
import GrandchildRectangle from './GrandchildRectangle.jsx';

class Rectangle extends Component {
  getComponentColor(componentId) {
    const color = this.props.components.find(comp => comp.id == componentId).color;
    return color;
  }

  getPseudoChild(grandchild) {
    // example: Board with direct child Row (where Row has a child Box)
    // grandchild is a reference to the Box child of Row
    // pseudoParent is a reference to Row itself (whose size is determined by its pseudoChild)
    // directParent refers to the instance of Row
    return this.props.components.find(comp => comp.id === this.props.childComponentId);

    // const ratioObj = {
    //   x:
    //     ((grandchild.position.x - pseudoParent.position.x) * directParent.position.width)
    //     / pseudoParent.position.width,
    //   y:
    //     ((grandchild.position.y - pseudoParent.position.y) * directParent.position.height)
    //     / pseudoParent.position.height,
    //   width: grandchild.position.width / pseudoParent.position.width,
    //   height: grandchild.position.height / pseudoParent.position.height,
    // };
    // return ratioObj;
  }

  handleResize(componentId, childId, target) {
    const focChild = this.props.components
      .find(comp => comp.id === componentId)
      .childrenArray.find(child => child.childId === childId);

    const transformation = {
      width: target.width() * target.scaleX(),
      height: target.height() * target.scaleY(),
      x: target.x() + focChild.position.x,
      y: target.y() + focChild.position.y,
    };

    this.props.handleTransform(componentId, childId, transformation);
  }

  handleDrag(componentId, childId, target) {
    console.log(target);

    const transformation = {
      x: target.x(),
      y: target.y(),
    };
    this.props.handleTransform(componentId, childId, transformation);
  }

  render() {
    const {
      x,
      y,
      scaleX,
      scaleY,
      childId,
      componentId,
      childComponentName,
      childComponentId,
      width,
      height,
      title,
      focusChild,
      components,
      draggable,
    } = this.props;

    // the Group is responsible for dragging of all children
    // the Rect emits changes to child width and height with help from Transformer
    return (
      <Group
        draggable={draggable}
        x={x}
        y={y}
        scaleX={scaleX}
        scaleY={scaleY}
        width={width}
        height={height}
        onDragEnd={event => this.handleDrag(componentId, childId, event.target)}
      >
        <Rect
          // a Konva Rect is generated for each child of the focusComponent (including the pseudochild, representing the focusComponent itself)
          name={`${childId}`}
          className={'childRect'}
          x={0}
          y={0}
          childId={childId}
          componentId={componentId}
          title={title}
          scaleX={1}
          scaleY={1}
          width={width}
          height={height}
          stroke={this.getComponentColor(childComponentId)}
          // fill={color}
          // opacity={0.8}
          onTransformEnd={event => this.handleResize(componentId, childId, event.target)}
          strokeWidth={4}
          strokeScaleEnabled={false}
          draggable={false}
          dashEnabled={childId === '-1'} // dash line only enabled for pseudochild
          dash={[10, 3]} // 10px dashes with 3px gaps
        />
        <Label>
          <Text
            fontStyle={'bold'}
            fontVariant={'small-caps'}
            // pseudochild's label should look different than normal children:
            text={childId === '-1' ? title.slice(0, title.length - 2) : title}
            fill={childId === '-1' ? this.getComponentColor(childComponentId) : 'white'}
            fontSize={childId === '-1' ? 15 : 10}
            x={4}
            y={childId === '-1' ? -15 : 5}
          />
        </Label>
        {// for all children other than the pseudoChild, find their component's children array and recursively render the children found there
        childId !== '-1'
          && components
            .find(comp => comp.title === childComponentName)
            .childrenArray.filter(child => child.childId !== '-1')
            // .sort((a, b) => parseInt(a.childId) - parseInt(b.childId)) // using i within map below, sorting by childId might be necessary
            .map((grandchild, i) => (
              <GrandchildRectangle
                key={i}
                components={components}
                componentId={componentId}
                directParentName={childComponentName}
                childComponentName={grandchild.componentName}
                childComponentId={grandchild.childComponentId}
                focusChild={focusChild}
                childId={childId} // scary addition, grandchildren rects default to childId of "direct" children
                // x={this.getPseudoChild().position.x}
                // y={}
                width={grandchild.position.width * (width / this.getPseudoChild().position.width)}
                height={
                  grandchild.position.height * (height / this.getPseudoChild().position.height)
                }
                x={
                  (grandchild.position.x - this.getPseudoChild().position.x)
                  * (width / this.getPseudoChild().position.width)
                }
                y={
                  (grandchild.position.y - this.getPseudoChild().position.y)
                  * (height / this.getPseudoChild().position.height)
                }
                // width={grandchild.position.width * (width / window.innerWidth)}
                // height={grandchild.position.height * (height / window.innerHeight)}
                // title={child.componentName + child.childId}
              />
            ))}
        {focusChild
          && focusChild.childId === childId
          && draggable && (
            <TransformerComponent
              focusChild={focusChild}
              rectClass={'childRect'}
              anchorSize={8}
              color={'grey'}
            />
        )}
      </Group>
    );
  }
}

export default Rectangle;
