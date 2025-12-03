import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import joblib
from PIL import Image
import os

# --- GPU Memory Setup ---
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        tf.config.set_logical_device_configuration(
            gpus[0],
            [tf.config.LogicalDeviceConfiguration(memory_limit=3800)]  # approx 3.8 GB
        )
        print("✅ GPU memory limit set to 3.8 GB")
    except RuntimeError as e:
        print(e)

# --- Dataset Path ---
dataset_path = r"D:\dataset"

# --- Parameters ---
img_size = 224
batch_size = 16  # Reduced for lower GPU memory

# --- Image Generator with Data Augmentation ---
train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.20,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

# --- Helper function to convert images to RGB ---
def preprocess_image(file_path):
    img = Image.open(file_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    return img

# --- Flow From Directory ---
train_gen = train_datagen.flow_from_directory(
    dataset_path,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'
)

val_gen = train_datagen.flow_from_directory(
    dataset_path,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'
)

# --- Model Setup ---
base_model = MobileNetV2(
    input_shape=(img_size, img_size, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
output_layer = Dense(train_gen.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output_layer)

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# --- Training ---
print("Training started...")
history = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=10
)

# --- Save Model & Labels ---
model.save("disease_cnn_model.h5")
joblib.dump(train_gen.class_indices, "labels.pkl")

print("✅ Model saved as disease_cnn_model.h5")
print("✅ Labels saved as labels.pkl")
print("Training completed.")
